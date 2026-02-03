'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Clock } from 'lucide-react';

type PaymentStatus = 'pending' | 'processing' | 'success';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [progress, setProgress] = useState(0);

  // Simulate payment processing
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setStatus('success');
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [status]);

  const handlePayment = () => {
    setStatus('processing');
  };

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold">GoPay</span>
            </div>
            <p className="text-green-100 text-sm">UPRAK POS Payment</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Amount Display */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm mb-2">Total Pembayaran</p>
              <p className="text-5xl font-bold text-gray-900 tracking-tight">
                {formattedAmount}
              </p>
            </div>

            {/* Status Section */}
            {status === 'pending' && (
              <div className="space-y-6">
                {/* QR Code Section */}
                <div className="flex justify-center">
                  <div className="border-4 border-green-500 rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                    <QrCode size={120} className="text-gray-700" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Scan dengan aplikasi GoPay Anda</p>
                  <p className="text-gray-500 text-xs">atau gunakan metode pembayaran lain</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Lanjutkan Pembayaran
                  </button>

                  <button className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                    Gunakan Metode Lain
                  </button>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="space-y-6">
                {/* Processing Indicator */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#grad)"
                        strokeWidth="8"
                        strokeDasharray={`${(progress / 100) * 282.7} 282.7`}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                        style={{
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%',
                        }}
                      />
                      <defs>
                        <linearGradient
                          id="grad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                    <Clock size={20} className="animate-spin" />
                    Memproses Pembayaran...
                  </div>
                  <p className="text-gray-500 text-sm">
                    Jangan tutup aplikasi ini hingga selesai
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6 text-center">
                {/* Success Checkmark */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle size={80} className="text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Pembayaran Berhasil!</h2>
                  <p className="text-gray-600">
                    Transaksi Anda telah berhasil diproses
                  </p>
                </div>

                {/* Receipt Info */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Jumlah</span>
                    <span className="font-semibold text-gray-900">{formattedAmount}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Waktu Transaksi</span>
                    <span className="font-semibold text-gray-900">
                      {new Date().toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ID Referensi</span>
                    <span className="font-mono text-sm font-semibold text-green-600">
                      {Math.random().toString(36).substring(2, 9).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg">
                    Download Bukti Pembayaran
                  </button>
                  <button className="w-full border-2 border-green-500 text-green-600 font-semibold py-4 rounded-2xl hover:bg-green-50 transition-all duration-300">
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-xs text-gray-500">
            <p>Transaksi aman. Dilindungi enkripsi GoPay</p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>🔒 Transaksi dijamin aman dengan teknologi keamanan terkini</p>
        </div>
      </div>
    </main>
  );
}
