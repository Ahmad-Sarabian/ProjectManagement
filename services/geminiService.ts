
import { GoogleGenAI } from "@google/genai";
import { Feature, TaskStatus } from "../types";

export const analyzeProjectData = async (features: Feature[]): Promise<string> => {
  // Always obtain API key exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Compact the data to reduce payload size and prevent RPC/Proxy errors
  const compactData = features.map(f => ({
    name: f.name,
    project: f.projectName,
    prio: f.priority,
    // Only include non-empty statuses to save tokens
    teams: Object.entries(f.teamStatuses)
      .filter(([_, status]) => status !== TaskStatus.NONE)
      .map(([team, status]) => ({
        t: team,
        s: status,
        b: f.blockageReasons?.[team as any] || null
      }))
  }));

  const prompt = `
    به عنوان یک مدیر پروژه ارشد، وضعیت فیچرهای زیر را تحلیل کن.
    لیست فشرده فیچرها و وضعیت تیم‌ها:
    ${JSON.stringify(compactData)}

    لطفاً تحلیل خود را به زبان فارسی و در قالب مارک‌دان (Markdown) ارائه بده. 
    تحلیل باید شامل موارد زیر باشد:
    ۱. خلاصه وضعیت کلی پروژه‌ها (با لحن حرفه‌ای).
    ۲. شناسایی دقیق گلوگاه‌ها (Bottlenecks) - تمرکز بر تیم‌هایی که بیشترین تسک‌های بلاک شده یا در جریان را دارند.
    ۳. پیشنهاد برای بازتوزیع منابع یا اولویت‌بندی مجدد.
    ۴. پیش‌بینی ریسک‌های احتمالی در هفته‌های آتی.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 },
        temperature: 0.7,
      },
    });

    // Access the .text property directly.
    return response.text || "خطا در دریافت پاسخ از هوش مصنوعی.";
  } catch (error: any) {
    console.error("Gemini Analysis Error Detail:", error);
    
    // Fallback message if the RPC still fails
    if (error?.message?.includes('500') || error?.message?.includes('xhr')) {
      return "خطای سیستمی در ارتباط با سرور هوش مصنوعی (RPC 500). این مشکل معمولاً موقتی است. لطفاً چند لحظه دیگر دوباره تلاش کنید.";
    }
    
    return "متاسفانه مشکلی در تحلیل هوشمند پیش آمد. لطفاً از صحت تنظیمات اطمینان حاصل کرده و دوباره تلاش کنید.";
  }
};
