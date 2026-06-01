/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Mic, MicOff } from "lucide-react";

type TransactionRecord = {
	id: string;
	label: string;
	amount: number | null;
	currency: "IDR";
	timestamp: string;
	rawText: string;
};

type SpeechRecognitionLike = {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start: () => void;
	stop: () => void;
	abort: () => void;
};

type WindowWithSpeechRecognition = Window & {
	SpeechRecognition?: new () => SpeechRecognitionLike;
	webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

// Minimal event type shapes to satisfy TypeScript in environments without DOM speech types
type SpeechRecognitionEvent = Event & {
	resultIndex: number;
	results: any;
};

type SpeechRecognitionErrorEvent = Event & {
	error: string;
	message?: string;
};

const TRIGGER_PHRASES = ["hey google", "hey fahh", "fahh", "ok fahh", "okay fahh"];

function normalizeText(text: string) {
	return text
		.toLowerCase()
		.replace(/[“”"]/g, "")
		.replace(/[^a-z0-9.,\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function formatCurrency(amount: number | null) {
	if (amount === null || Number.isNaN(amount)) return "Amount not detected";

	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(amount);
}

function parseAmount(text: string) {
	const normalized = normalizeText(text);
	// try numeric forms first (e.g., 25.000 or 25 ribu or 3 juta)
	const compactMatch = normalized.match(/(?:rp\s*)?(\d+(?:[.,]\d{1,3})*)(?:\s?(k|rb|rbu|ribu|jt|juta|miliar|juta|triliun))?/i);
	if (compactMatch) {
		const rawNumber = compactMatch[1];
		let parsedNumber: number | null = null;

		// Heuristic: if comma present, treat comma as decimal separator (Indo format)
		if (rawNumber.includes(",")) {
			const cleaned = rawNumber.replace(/\./g, "").replace(",", ".");
			parsedNumber = parseFloat(cleaned);
		} else if (rawNumber.includes(".")) {
			const after = rawNumber.split(".").pop() ?? "";
			if (after.length === 3) {
				// dots look like thousand separators
				const cleaned = rawNumber.replace(/\./g, "");
				parsedNumber = parseFloat(cleaned);
			} else {
				// treat as decimal
				parsedNumber = parseFloat(rawNumber);
			}
		} else {
			parsedNumber = parseFloat(rawNumber);
		}

		if (!Number.isFinite(parsedNumber)) parsedNumber = null;

		const scaleToken = compactMatch[2] ? compactMatch[2].toLowerCase() : undefined;
		const scaleMap: Record<string, number> = {
			k: 1000,
			rb: 1000,
			rbu: 1000,
			ribu: 1000,
			jt: 1000000,
			juta: 1000000,
			miliar: 1000000000,
			triliun: 1000000000000,
		};

		const multiplier = scaleToken && scaleMap[scaleToken] ? scaleMap[scaleToken] : 1;
		if (parsedNumber !== null) {
			const final = parsedNumber * multiplier;
			if (Number.isFinite(final)) return final;
		}
	}

	// try word-based Indonesian numbers (e.g., "dua puluh lima ribu")
	const wordsMatch = normalized.match(/((?:\b(?:nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|belas|puluh|ratus|ribu|juta|miliar|triliun)\b|\s)+)/i);
	if (!wordsMatch) return null;

	const words = wordsMatch[1].trim().split(/\s+/);

	const units: Record<string, number> = {
		nol: 0,
		satu: 1,
		satua: 1,
		dua: 2,
		tiga: 3,
		empat: 4,
		lima: 5,
		enam: 6,
		tujuh: 7,
		delapan: 8,
		sembilan: 9,
		sepuluh: 10,
		sebelas: 11,
	};
	const scales: Record<string, number> = {
		puluh: 10,
		ratus: 100,
		ribu: 1_000,
		rb: 1_000,
		rbu: 1_000,
		juta: 1_000_000,
		miliar: 1_000_000_000,
	};

	let total = 0;
	let current = 0;

	for (const raw of words) {
		const w = raw.toLowerCase();
		if (w in units) {
			current += units[w];
			continue;
		}

		if (w === "belas") {
			current = (current || 1) + 10;
			continue;
		}

		if (w.startsWith("se") && (w === "seribu" || w === "seratus" || w === "sepuluh" || w === "sebelas")) {
			// handle se- prefixes explicitly
			if (w === "seribu") {
				total += 1_000;
				current = 0;
			} else if (w === "seratus") {
				current += 100;
			} else if (w === "sepuluh") {
				current += 10;
			} else if (w === "sebelas") {
				current += 11;
			}
			continue;
		}

		if (w in scales) {
			const scale = scales[w];
			if (scale >= 1000) {
				if (current === 0) current = 1;
				total += current * scale;
				current = 0;
			} else {
				if (current === 0) current = 1;
				current = current * scale;
			}
			continue;
		}
	}

	const final = total + current;
	return final > 0 && Number.isFinite(final) ? final : null;
}

function parseTransaction(text: string) {
	const normalized = normalizeText(text);
	const amount = parseAmount(normalized);

	const itemPatterns = [
		/(?:membeli|beli|bayar|spend|spent|purchase|pesan|order)\s+(.+?)(?:\s+(?:seharga|senilai|sebesar|dengan|rp|rupiah|dan|karena)\b|[.,]|$)/i,
		/(?:for|buying|bought)\s+(.+?)(?:\s+(?:for|worth|at)\b|[.,]|$)/i,
	];

	let label = normalized;
	for (const pattern of itemPatterns) {
		const match = normalized.match(pattern);
		if (match?.[1]) {
			label = match[1].trim();
			break;
		}
	}

	if (!label || label === normalized) {
		const amountIndex = normalized.search(/(?:rp\s*)?(\d+(?:[.,]\d{3})+|\d+)(?:\s?(k|rbu|ribu))?/i);
		if (amountIndex > 0) {
			label = normalized.slice(0, amountIndex).replace(/^(aku|saya|baru saja|baru)?\s*/i, "").trim();
		}
	}


	// Clean up common leading words and duplicate recognition artifacts
	label = label.replace(/^(aku|saya|baru saja|baru|mau|ingin|beli|membeli|catat|catatlah)\s+/i, "").trim();

	// Collapse repeated adjacent words often produced by interim results: "beli beli batagor" -> "beli batagor"
	label = label.replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1");

	// Strip isolated numeric tokens and scale words that may have been captured into the item label (e.g., "20", "2rb", "juta", "rp30")
	label = label.replace(/\b(?:\d+(?:[.,]\d+)?|rp|rb|rbu|ribu|k|jt|juta|miliar|triliun)\b/gi, "").trim();

	// Remove any tokens that still contain digits (like rp30) and collapse extra spaces
	label = label.replace(/\b\S*\d+\S*\b/g, "").replace(/\s+/g, " ").trim();

	if (!label) label = "Transaction detected";

	return {
		label,
		amount,
		rawText: text.trim(),
	};
}

function findTrigger(text: string) {
	const normalized = normalizeText(text);
	for (const phrase of TRIGGER_PHRASES) {
		const index = normalized.indexOf(phrase);
		if (index !== -1) {
			return {
				phrase,
				index,
				after: normalized.slice(index + phrase.length).replace(/^\s*[,.:;-]?\s*/, "").trim(),
			};
		}
	}

	return null;
}

export default function AssistantDemoPage() {
	const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
	const resetTimerRef = React.useRef<number | null>(null);
	const pendingTextRef = React.useRef("");
	const armedRef = React.useRef(false);

	const [isSupported, setIsSupported] = React.useState(false);
	const [isListening, setIsListening] = React.useState(false);
	const [isArmed, setIsArmed] = React.useState(false);
	const [transcript, setTranscript] = React.useState("");
	const [liveText, setLiveText] = React.useState("");
	const [, setStatus] = React.useState("Idle");
	const [transactions, setTransactions] = React.useState<TransactionRecord[]>([]);

	// UI animation state: per-word animation and transaction entrance
	const [wordsMounted, setWordsMounted] = React.useState(false);
	const lastTxIdRef = React.useRef<string | null>(null);
	const [showTransaction, setShowTransaction] = React.useState(false);

	const latestTransaction = transactions[0] ?? null;

	React.useEffect(() => {
		armedRef.current = isArmed;
	}, [isArmed]);

	// (wake-word capture removed for simplified auto-parse demo)

	const finalizeCapture = React.useCallback((source = pendingTextRef.current) => {
		const original = source.trim();
		// If user prefixed with a wake word, strip it before parsing so parsing focuses on the intent
		const trigger = findTrigger(original);
		const text = trigger ? (trigger.after || original.replace(new RegExp(trigger.phrase, "i"), "").trim()) : original;
		if (!text) {
			pendingTextRef.current = "";
			setIsArmed(false);
			setLiveText("");
			setStatus("Ready");
			return;
		}

		setStatus("Parsing captured speech (client-side)...");
		const parsed = parseTransaction(text);

		const transaction: TransactionRecord = {
			id: crypto.randomUUID(),
			label: parsed.label,
			amount: parsed.amount,
			currency: "IDR",
			timestamp: new Intl.DateTimeFormat("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				day: "2-digit",
				month: "short",
			}).format(new Date()),
			rawText: parsed.rawText,
		};

		// reset transaction animation flag so effect can animate in
		setShowTransaction(false);
		setTransactions((current) => [transaction, ...current].slice(0, 5));
		setTranscript(parsed.rawText);
		setLiveText("");
		setIsArmed(false);
		pendingTextRef.current = "";
		setStatus(`Captured ${parsed.label}${parsed.amount ? ` · ${formatCurrency(parsed.amount)}` : ""}`);
	}, []);

	// Trigger per-word mount animation when transcript changes
	React.useEffect(() => {
		setWordsMounted(false);
		const t = window.setTimeout(() => setWordsMounted(true), 20);
		return () => window.clearTimeout(t);
	}, [transcript, liveText]);

	// Animate transaction card when a new transaction is added
	React.useEffect(() => {
		const latest = transactions[0];
		if (!latest) return;
		if (lastTxIdRef.current !== latest.id) {
			// small delay then animate in
			setTimeout(() => setShowTransaction(true), 60);
			lastTxIdRef.current = latest.id;
		}
	}, [transactions]);

	const scheduleFinalize = React.useCallback(() => {
		if (resetTimerRef.current) {
			window.clearTimeout(resetTimerRef.current);
		}

		resetTimerRef.current = window.setTimeout(() => {
			finalizeCapture();
		}, 1400);
	}, [finalizeCapture]);

	React.useEffect(() => {
		const win = window as WindowWithSpeechRecognition;
		const SpeechRecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition;
		setIsSupported(Boolean(SpeechRecognitionClass));

		if (!SpeechRecognitionClass) return;

		const recognition = new SpeechRecognitionClass() as SpeechRecognitionLike & EventTarget;
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "id-ID";

		const handleResult = (event: Event) => {
			const speechEvent = event as SpeechRecognitionEvent;
			let interim = "";
			let finalText = "";

			for (let index = speechEvent.resultIndex; index < speechEvent.results.length; index += 1) {
				const result = speechEvent.results[index];
				const transcriptChunk = result[0]?.transcript ?? "";
				if (result.isFinal) {
					finalText += `${transcriptChunk} `;
				} else {
					interim += `${transcriptChunk} `;
				}
			}

			// Only proceed if we have either interim or final text
			if (!finalText && !interim) return;

			// Update the visible transcript with what's spoken now
			setTranscript(`${pendingTextRef.current} ${finalText} ${interim}`.trim());

			// If we have final text, commit it to the pending buffer (avoid duplicating partials)
			if (finalText) {
				pendingTextRef.current = `${pendingTextRef.current} ${finalText}`.trim();
			}

			// For live feedback, show pending + interim (but don't append interim into pending)
			if (interim) {
				setLiveText(`${pendingTextRef.current} ${interim}`.trim());
			} else {
				setLiveText(pendingTextRef.current);
			}

			// Auto-parse mode: schedule a finalize on silence
			setStatus("Capturing transaction details");
			scheduleFinalize();
			return;
		};

		const handleError = (event: Event) => {
			const speechError = event as SpeechRecognitionErrorEvent;
			setStatus(`Speech error: ${speechError.error}`);
			setIsListening(false);
			setIsArmed(false);
			pendingTextRef.current = "";
			setLiveText("");
		};

		const handleEnd = () => {
			setIsListening(false);
			if (armedRef.current && pendingTextRef.current.trim()) {
				finalizeCapture();
			}
		};

		recognition.addEventListener("result", handleResult);
		recognition.addEventListener("error", handleError);
		recognition.addEventListener("end", handleEnd);

		recognitionRef.current = recognition;

		return () => {
			recognition.removeEventListener("result", handleResult);
			recognition.removeEventListener("error", handleError);
			recognition.removeEventListener("end", handleEnd);
			recognition.abort();
			recognitionRef.current = null;
		};
	}, [finalizeCapture, scheduleFinalize]);

	React.useEffect(() => {
		if (!isListening || !recognitionRef.current) return;

		try {
			recognitionRef.current.start();
			setStatus("Listening for a wake word");
		} catch {
			setStatus("Microphone already active or unavailable");
		}
	}, [isListening]);

	React.useEffect(() => {
		return () => {
			if (resetTimerRef.current) {
				window.clearTimeout(resetTimerRef.current);
			}
		};
	}, []);

	const toggleListening = () => {
		if (!isSupported || !recognitionRef.current) {
			setStatus("Speech recognition is not supported in this browser");
			return;
		}

		if (isListening) {
			recognitionRef.current.stop();
			setIsListening(false);
			setIsArmed(false);
			armedRef.current = false;
			pendingTextRef.current = "";
			setLiveText("");
			setStatus("Stopped");
			return;
		}

		setIsListening(true);
	};
    
	return (
		<main className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
			<div className="flex flex-col items-center gap-8">
				<button
					onClick={toggleListening}
					aria-label={isListening ? "Stop listening" : "Start listening"}
					className={`relative flex items-center justify-center rounded-full focus:outline-none transition-transform ${isListening ? 'scale-105' : 'scale-100'}`}
					style={{ width: 220, height: 220 }}
				>
					<div className={`absolute inset-0 rounded-full ${isListening ? 'ring-8 ring-cyan-300/30 animate-pulse' : 'ring-2 ring-slate-200'}`} />
					<div className={`flex items-center justify-center rounded-full bg-white shadow-lg`} style={{ width: 180, height: 180 }}>
						{isListening ? <Mic className="h-20 w-20 text-cyan-600" /> : <MicOff className="h-20 w-20 text-slate-400" />}
					</div>
				</button>

				<div className="w-[min(720px,90vw)] p-0 text-center">
					<div className="text-2xl sm:text-4xl font-semibold text-slate-900 leading-snug">
						{(transcript || liveText || "").split(/\s+/).filter(Boolean).map((word, i) => {
							const normalized = normalizeText(word);
							const labelTokens = normalizeText(latestTransaction?.label ?? "").split(/\s+/).filter(Boolean);
							// build amount token candidates from latestTransaction.amount
							const amountCandidates: string[] = [];
							if (latestTransaction?.amount) {
								const amt = latestTransaction.amount;
								amountCandidates.push(String(amt));
								amountCandidates.push(new Intl.NumberFormat("id-ID").format(amt));
								if (amt % 1000000 === 0) {
									amountCandidates.push(String(amt / 1000000));
									amountCandidates.push("juta");
								}
								if (amt % 1000 === 0) {
									amountCandidates.push(String(amt / 1000));
									amountCandidates.push("ribu");
									amountCandidates.push("rb");
									amountCandidates.push("rbu");
								}
							}

							const amountMatches = amountCandidates.some((c) => normalizeText(c) === normalized || c === normalized);
							const isLabel = labelTokens.length > 0 && labelTokens.includes(normalized);
							const isHighlighted = isLabel || amountMatches;
							const delay = i * 60;
							return (
								<span
									key={`${word}-${i}`}
									style={{ transition: "all 260ms ease", transitionDelay: `${delay}ms`, opacity: wordsMounted ? 1 : 0, transform: wordsMounted ? "translateY(0)" : "translateY(6px)", marginRight: 6 }}
									className={isHighlighted ? "px-1 rounded bg-yellow-200 text-yellow-800" : ""}
								>
									{word}
								</span>
							);
						})}
						<span className={`inline-block w-1 h-6 align-middle ml-1 bg-slate-900 ${wordsMounted ? 'animate-pulse' : ''}`} />
					</div>
				</div>

				{latestTransaction ? (
					<div className={`w-[min(520px,80vw)] mt-2 p-3 text-center bg-transparent transform transition-all duration-500 ${showTransaction ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}`}>
						<div className="text-sm text-slate-600">{latestTransaction.label}</div>
						<div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(latestTransaction.amount)}</div>
					</div>
				) : null}
			</div>
		</main>
	);
}
