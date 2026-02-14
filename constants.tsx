
import { TeamName, Feature, TaskStatus } from './types';

export const TEAMS_ORDER: TeamName[] = [
  TeamName.PRODUCT,
  TeamName.DESIGN,
  TeamName.BACKEND1,
  TeamName.BACKEND2,
  TeamName.FRONTEND,
  TeamName.QA,
  TeamName.RELEASE
];

const generateStatuses = (progress: number): Record<TeamName, TaskStatus> => {
  // Simple logic to distribute statuses based on "how far" the feature is
  const statuses: any = {};
  TEAMS_ORDER.forEach((team, index) => {
    const stage = index / TEAMS_ORDER.length;
    if (stage < progress - 0.2) statuses[team] = TaskStatus.COMPLETED;
    else if (stage < progress) statuses[team] = TaskStatus.IN_PROGRESS;
    else if (stage < progress + 0.1) statuses[team] = TaskStatus.WAITING;
    else statuses[team] = TaskStatus.NONE;
  });
  return statuses as Record<TeamName, TaskStatus>;
};

export const INITIAL_FEATURES: Feature[] = [
  // Project 1: امنیت حساب
  { id: '101', name: 'احراز هویت دوعاملی (SMS)', projectName: 'امنیت حساب', priority: 'A1', description: 'ارسال کد تایید از طریق پیامک برای ورود ایمن', teamStatuses: generateStatuses(0.8) },
  { id: '102', name: 'لاگ نشست‌های فعال', projectName: 'امنیت حساب', priority: 'A2', description: 'نمایش دستگاه‌های متصل به حساب کاربری', teamStatuses: generateStatuses(0.5) },
  { id: '103', name: 'الگوریتم هش گذرواژه', projectName: 'امنیت حساب', priority: 'B1', description: 'ارتقای امنیت دیتابیس با Argon2', teamStatuses: generateStatuses(0.3) },
  
  // Project 2: تجربه کاربری (UX)
  { id: '201', name: 'تم تاریک (Dark Mode)', projectName: 'تجربه کاربری', priority: 'B1', description: 'پیاده‌سازی استایل‌های تیره برای کل سامانه', teamStatuses: generateStatuses(0.9) },
  { id: '202', name: 'انیمیشن‌های بارگذاری', projectName: 'تجربه کاربری', priority: 'C1', description: 'استفاده از Skeleton Screen در صفحات سنگین', teamStatuses: generateStatuses(1.0) },
  { id: '203', name: 'جستجوی صوتی', projectName: 'تجربه کاربری', priority: 'B2', description: 'افزودن قابلیت سرچ کالا با صدا', teamStatuses: generateStatuses(0.2) },
  { id: '204', name: 'بازطراحی فوتر', projectName: 'تجربه کاربری', priority: 'C2', description: 'بهبود لینک‌های دسترسی سریع در پایین سایت', teamStatuses: generateStatuses(0.7) },

  // Project 3: زیرساخت داده
  { id: '301', name: 'مهاجرت به PostgreSQL 16', projectName: 'زیرساخت داده', priority: 'A1', description: 'به‌روزرسانی موتور دیتابیس اصلی', teamStatuses: generateStatuses(0.4) },
  { id: '302', name: 'کشینگ با Redis', projectName: 'زیرساخت داده', priority: 'A3', description: 'کاهش بار کوئری‌های تکراری با لایه کش', teamStatuses: generateStatuses(0.6) },
  { id: '303', name: 'سیستم آرشیو تراکنش‌ها', projectName: 'زیرساخت داده', priority: 'B3', description: 'انتقال داده‌های قدیمی به کلد استورج', teamStatuses: generateStatuses(0.1) },

  // Project 4: پنل فروشندگان
  { id: '401', name: 'داشبورد نموداری فروش', projectName: 'پنل فروشندگان', priority: 'A2', description: 'نمایش آمار فروش ماهانه به صورت چارت', teamStatuses: generateStatuses(0.6) },
  { id: '402', name: 'چت آنلاین با خریدار', projectName: 'پنل فروشندگان', priority: 'B1', description: 'سیستم پیام‌رسانی داخلی برای پاسخ به سوالات', teamStatuses: generateStatuses(0.3) },
  { id: '403', name: 'مدیریت موجودی هوشمند', projectName: 'پنل فروشندگان', priority: 'A3', description: 'پیش‌بینی اتمام کالا بر اساس روند فروش', teamStatuses: generateStatuses(0.2) },

  // Project 5: اپلیکیشن موبایل
  { id: '501', name: 'پوش نوتیفیکیشن Firebase', projectName: 'اپلیکیشن موبایل', priority: 'A1', description: 'ارسال اعلان‌های لحظه‌ای برای تخفیف‌ها', teamStatuses: generateStatuses(0.9) },
  { id: '502', name: 'پرداخت با Apple Pay', projectName: 'اپلیکیشن موبایل', priority: 'B2', description: 'تسهیل خرید برای کاربران iOS', teamStatuses: generateStatuses(0.1) },
  { id: '503', name: 'اسکنر بارکد محصولات', projectName: 'اپلیکیشن موبایل', priority: 'C1', description: 'جستجوی کالا در اپ با دوربین گوشی', teamStatuses: generateStatuses(0.5) },

  // Project 6: سیستم پرداخت
  { id: '601', name: 'کیف پول داخلی', projectName: 'سیستم پرداخت', priority: 'A1', description: 'شارژ حساب و خرید بدون درگاه بانکی', teamStatuses: generateStatuses(0.7) },
  { id: '602', name: 'تسویه حساب خودکار', projectName: 'سیستم پرداخت', priority: 'A2', description: 'واریز روزانه سود فروشندگان به شبا', teamStatuses: generateStatuses(0.4) },
  { id: '603', name: 'اعتبارسنجی کارت بانکی', projectName: 'سیستم پرداخت', priority: 'B1', description: 'چک کردن پیش‌شماره و الگوریتم کارت', teamStatuses: generateStatuses(1.0) },

  // Project 7: پشتیبانی هوشمند
  { id: '701', name: 'بات پاسخگوی AI', projectName: 'پشتیبانی هوشمند', priority: 'B1', description: 'پاسخ خودکار به سوالات متداول با جمینای', teamStatuses: generateStatuses(0.4) },
  { id: '702', name: 'سیستم تیکتینگ جدید', projectName: 'پشتیبانی هوشمند', priority: 'C1', description: 'دسته‌بندی خودکار تیکت‌ها بر اساس اولویت', teamStatuses: generateStatuses(0.2) },
  { id: '703', name: 'نظرسنجی پس از تماس', projectName: 'پشتیبانی هوشمند', priority: 'C2', description: 'اندازه‌گیری شاخص رضایت مشتریان (CSAT)', teamStatuses: generateStatuses(0.8) },

  // Project 8: مارکتینگ و سئو
  { id: '801', name: 'تولید محتوای خودکار بلاگ', projectName: 'مارکتینگ و سئو', priority: 'B2', description: 'استفاده از هوش مصنوعی برای مقالات خبری', teamStatuses: generateStatuses(0.3) },
  { id: '802', name: 'سیستم کد تخفیف پویا', projectName: 'مارکتینگ و سئو', priority: 'A3', description: 'تولید کوپن بر اساس رفتار خرید کاربر', teamStatuses: generateStatuses(0.5) },
  { id: '803', name: 'بهینه‌سازی متا تگ‌ها', projectName: 'مارکتینگ و سئو', priority: 'C1', description: 'بهبود ایندکس شدن صفحات در گوگل', teamStatuses: generateStatuses(0.9) },

  // Project 9: لجستیک و انبار
  { id: '901', name: 'ردیابی آنلاین سفیر', projectName: 'لجستیک و انبار', priority: 'A1', description: 'نمایش موقعیت پیک روی نقشه برای مشتری', teamStatuses: generateStatuses(0.6) },
  { id: '902', name: 'سیستم مدیریت مرجوعی', projectName: 'لجستیک و انبار', priority: 'B2', description: 'گردش کار بازگشت کالا به انبار', teamStatuses: generateStatuses(0.2) },
  { id: '903', name: 'پرینت خودکار لیبل', projectName: 'لجستیک و انبار', priority: 'C1', description: 'اتصال نرم‌افزار انبار به پرینترهای حرارتی', teamStatuses: generateStatuses(1.0) },

  // Project 10: گزارشات مدیریتی
  { id: '1001', name: 'گزارش سود و زیان لحظه‌ای', projectName: 'گزارشات مدیریتی', priority: 'A1', description: 'محاسبه مارجین سود پس از کسر مالیات', teamStatuses: generateStatuses(0.4) },
  { id: '1002', name: 'پیش‌بینی تقاضای بازار', projectName: 'گزارشات مدیریتی', priority: 'B1', description: 'تحلیل داده‌های سال گذشته برای خرید کالا', teamStatuses: generateStatuses(0.1) },
  { id: '1003', name: 'پنل نظارت بر عملکرد تیم', projectName: 'گزارشات مدیریتی', priority: 'C1', description: 'تعداد تسک‌های بسته شده در هر اسپرینت', teamStatuses: generateStatuses(0.3) },
];
