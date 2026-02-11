'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

type PaymentStatus = 'pending' | 'processing' | 'success';

interface PaymentData {
  merchantName: string;
  customerName: string;
  price: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [decodeError, setDecodeError] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>('pending');

  // Decode base64 data
  useEffect(() => {
    if (dataParam) {
      try {
        const decoded = atob(dataParam);
        const parsed = JSON.parse(decoded);
        setPaymentData(parsed);
      } catch (error) {
        console.error('Failed to decode payment data:', error);
        setDecodeError(true);
      }
    }
  }, [dataParam]);

  const handlePayment = () => {
    setStatus('processing');
    // Simulate payment completion after 2 seconds
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  const formattedAmount = paymentData
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(paymentData.price))
    : 'Rp 0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900">Review Pembayaran</h1>
          </div>

          {/* Content */}
          <div className="p-0">
            {decodeError ? (
              <div className="flex flex-col items-center gap-4 py-8 px-8">
                <AlertCircle size={48} className="text-red-500" />
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Gagal Memuat Data
                  </h2>
                  <p className="text-gray-600">URL tidak lengkap atau data tidak valid</p>
                </div>
              </div>
            ) : !paymentData ? (
              <div className="text-center py-8 px-8">
                <p className="text-gray-600 animate-pulse">Memuat data pembayaran...</p>
              </div>
            ) : status === 'pending' ? (
              <div className="space-y-0">
                {/* Logo & Info Section */}
                <div className="border-b border-gray-200 p-6 pb-4">
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(paymentData.customerName)}`}
                        alt={paymentData.customerName}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dari</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {paymentData.customerName}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center text-gray-400 text-xl">↓</div>

                    {/* Merchant Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {paymentData.merchantName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ke</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {paymentData.merchantName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="border-b border-gray-200 p-6 pb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Jumlah Pembayaran</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formattedAmount}
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="border-b border-gray-200 p-6 pb-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-4">Pilihan Pembayaran</p>
                  
                  {/* GoPay Option */}
                  <button className="w-full">
                    <div className="flex items-center gap-3 p-3 border-2 border-green-500 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">GoPay</p>
                        <p className="text-xs text-gray-600">Saldo & Cicilan</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 border-2 border-green-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Info Section */}
                <div className="p-6 pb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                    <p className="text-xs text-blue-900">
                      <span className="font-semibold">Catat informasi pembayaran</span> detail & promo, jangan membagikannya kepada siapa pun.
                      <a href="#" className="text-blue-600 ml-1">Syarat & ketentuan</a>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3 p-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300"
                  >
                    Lanjutkan Pembayaran
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    Ubah Metode Pembayaran
                  </button>
                </div>
              </div>
            ) : status === 'processing' ? (
              <div className="space-y-6 py-16 px-8 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin">
                    <Clock size={52} className="text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Memproses Pembayaran...</p>
                  <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Success Checkmark */}
                <div className="flex justify-center py-8 border-b border-gray-200">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={48} className="text-green-600" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="p-6 border-b border-gray-200 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Pembayaran Berhasil!</h2>
                  <p className="text-sm text-gray-600">Transaksi Anda telah dikonfirmasi</p>
                </div>

                {/* Receipt Info */}
                <div className="p-6 space-y-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Merchant</p>
                    <p className="font-semibold text-gray-900">{paymentData.merchantName}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jumlah</p>
                    <p className="text-2xl font-bold text-green-600">{formattedAmount}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Waktu</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date().toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Button */}
                <div className="p-6">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300">
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-md"><div className="bg-white rounded-2xl shadow-xl"><div className="bg-white border-b border-gray-200 p-6"><h1 className="text-xl font-bold text-gray-900">Review Pembayaran</h1></div><div className="p-8"><div className="text-center"><p className="text-gray-600 animate-pulse">Memuat...</p></div></div></div></div>}>
        <PaymentContent />
      </Suspense>
    </main>
  );
}
