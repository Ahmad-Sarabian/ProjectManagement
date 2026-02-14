
import { GoogleGenAI } from "@google/genai";
import { Feature, TaskStatus } from "../types";

export const analyzeProjectData = async (features: Feature[]): Promise<string> => {
  // Always obtain API key exclusively from process.env.API_KEY.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "کلید API یافت نشد. لطفاً تنظیمات محیطی (Environment Variables) خود را بررسی کنید.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
    // Attempt 1: Try with the Pro model and Thinking Config
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 },
        temperature: 0.7,
      },
    });

    return response.text || "خطا در دریافت پاسخ از هوش مصنوعی.";
  } catch (error: any) {
    console.warn("Gemini Pro Analysis failed, attempting fallback to Flash...", error);
    
    try {
        // Attempt 2: Fallback to Flash model (lighter, often avoids XHR timeout/size issues)
        const fallbackResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        });
        return fallbackResponse.text || "خطا در دریافت پاسخ از هوش مصنوعی (مدل جایگزین).";
    } catch (fallbackError: any) {
        console.error("Gemini Fallback Error:", fallbackError);
        
        // Detailed user-friendly error message
        if (fallbackError?.message?.includes('500') || fallbackError?.message?.includes('xhr') || fallbackError?.message?.includes('fetch')) {
            return `
### خطای ارتباط با سرور
متاسفانه ارتباط با سرور هوش مصنوعی برقرار نشد (Error 500/XHR).

**دلایل احتمالی:**
۱. اختلال در شبکه اینترنت یا اتصال VPN.
۲. مسدود شدن درخواست توسط مرورگر (AdBlocker یا تنظیمات امنیتی).
۳. ترافیک بالای سرورهای گوگل.

*لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.*
            `;
        }
        
        return "متاسفانه مشکلی در تحلیل هوشمند پیش آمد. لطفاً دوباره تلاش کنید.";
    }
  }
};