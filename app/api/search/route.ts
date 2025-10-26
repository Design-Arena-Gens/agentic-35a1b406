import { NextRequest } from 'next/server';

interface Business {
  name: string;
  phone: string;
  address: string;
  source: string;
}

// Mock data simulating search results for demonstration
const mockBusinesses: Business[] = [
  {
    name: 'شرکت بتن رضوان گیلان',
    phone: '013-33445566',
    address: 'رشت، خیابان امام خمینی، پلاک 123',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'کارخانه مصالح ساختمانی سپهر',
    phone: '013-33778899',
    address: 'لاهیجان، میدان شهرداری، جنب بانک ملی',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'تولیدی بتن آماده شمال',
    phone: '013-33556677',
    address: 'رشت، کیلومتر 5 جاده رشت-قزوین',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'فروشگاه مصالح امیر',
    phone: '013-33998877',
    address: 'رودسر، خیابان امام، کوچه گلستان',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'شرکت بتن گسترش گیلان',
    phone: '013-33224455',
    address: 'رشت، بلوار گیلان، نرسیده به میدان جانبازان',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'تامین مصالح ساختمانی نوین',
    phone: '013-33667788',
    address: 'آستارا، میدان ساحلی، پاساژ تجاری',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'کارخانه بتن ماشینی فولاد',
    phone: '013-33112233',
    address: 'بندر انزلی، شهرک صنعتی، فاز 2',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'مصالح ساختمانی پارسیان',
    phone: '013-33445599',
    address: 'رشت، خیابان معلم، نبش کوچه 14',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'بتن آماده شهر سبز',
    phone: '013-33778866',
    address: 'رشت، اتوبان امام علی، کیلومتر 3',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'تولیدی سیمان و بتن کاسپین',
    phone: '013-33889900',
    address: 'لنگرود، جاده ساحلی، روبروی پارک ساحلی',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'فروشگاه مصالح رضایی',
    phone: '013-33556688',
    address: 'صومعه‌سرا، میدان امام، پلاک 45',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'شرکت بتن و مصالح ایرانیان',
    phone: '013-33224466',
    address: 'رشت، کیلومتر 7 جاده رشت-انزلی',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'تامین کننده مصالح ساختمانی زرین',
    phone: '013-33998811',
    address: 'تالش، شهر هشتپر، خیابان اصلی',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'کارخانه بتن پیش‌ساخته گیلان',
    phone: '013-33667799',
    address: 'رشت، شهرک صنعتی رشت، فاز 1',
    source: 'نمونه داده آزمایشی'
  },
  {
    name: 'مصالح و بتن آماده آرین',
    phone: '013-33445588',
    address: 'رودبار، میدان شهرداری، ساختمان تجاری',
    source: 'نمونه داده آزمایشی'
  }
];

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send progress update
      const sendProgress = (message: string) => {
        const data = `data: ${JSON.stringify({ type: 'progress', message })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Send result
      const sendResult = (business: Business) => {
        const data = `data: ${JSON.stringify({ type: 'result', business })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        sendProgress('شروع جستجو در منابع مختلف...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        sendProgress('در حال جستجو در پایگاه‌های داده محلی...');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simulate search results coming in gradually
        for (let i = 0; i < mockBusinesses.length; i++) {
          sendProgress(`یافت شد: ${mockBusinesses[i].name} (${i + 1}/${mockBusinesses.length})`);
          sendResult(mockBusinesses[i]);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        sendProgress(`جستجو کامل شد! ${mockBusinesses.length} کسب‌وکار یافت شد.`);

        const completeData = `data: ${JSON.stringify({ type: 'complete', total: mockBusinesses.length })}\n\n`;
        controller.enqueue(encoder.encode(completeData));

      } catch (error) {
        const errorData = `data: ${JSON.stringify({
          type: 'error',
          message: 'خطا در جستجو. لطفا دوباره تلاش کنید.'
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
