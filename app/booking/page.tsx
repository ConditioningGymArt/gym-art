'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

function getDates() {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const dates = getDates();

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      setMessage('日付と時間を選んでください');
      return;
    }
    setLoading(true);
    const start = new Date(selectedDate);
    const [h, m] = selectedTime.split(':');
    start.setHours(Number(h), Number(m), 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const { error } = await supabase.from('sessions').insert({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'booked',
      session_type: 'conditioning',
      booked_at: new Date().toISOString(),
    });

    if (error) {
      setMessage('予約に失敗しました: ' + error.message);
    } else {
      setMessage('予約完了しました！');
      setSelectedDate(null);
      setSelectedTime(null);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">予約する</h1>
      <p className="text-gray-400 mb-3">日付を選択</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {dates.map((d, i) => {
          const isSelected = selectedDate?.toDateString() === d.toDateString();
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(d)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div>{d.getMonth() + 1}/{d.getDate()}</div>
              <div className="text-xs">{'日月火水木金土'[d.getDay()]}</div>
            </button>
          );
        })}
      </div>
      <p className="text-gray-400 mb-3">時間を選択</p>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {TIMES.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTime(t)}
            className={`py-3 rounded-lg text-sm font-medium transition ${
              selectedTime === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {selectedDate && selectedTime && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-sm">予約内容</p>
          <p className="text-white font-semibold">
            {selectedDate.getMonth() + 1}/{selectedDate.getDate()} {'日月火水木金土'[selectedDate.getDay()]}曜日 {selectedTime}〜
          </p>
        </div>
      )}
      <button
        onClick={handleBook}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold rounded-lg transition"
      >
        {loading ? '予約中...' : '予約する'}
      </button>
      {message && (
        <p className="mt-4 text-center text-yellow-400">{message}</p>
      )}
    </main>
  );
}
