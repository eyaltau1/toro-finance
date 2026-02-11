// api/analyze-mortgage.js
// גרסה משופרת עם Prompt מפורט יותר

const EXTRACTION_PROMPT = `אתה מומחה בקריאת מסמכי הצעות משכנתא מבנקים בישראל.

## המשימה
קרא את המסמך וחלץ את נתוני המשכנתא מטבלת "סל מוצע".

## מבנה טבלת "סל מוצע" הסטנדרטי

הטבלה מכילה עמודות עבור כל מסלול (מסלול 1, מסלול 2, מסלול 3, לפעמים מסלול 4) ועמודת סה"כ.

השורות בטבלה (מימין לשמאל):
1. **שם ההלוואה** - סוג המסלול (פריים, קבועה לא צמודה, משתנה, וכו')
2. **סכום ההלוואה בש"ח** - הסכום של כל מסלול
3. **תקופות ההלוואה (בחודשים)** - למשל 144, 240, 300, 360
4. **מס' ההלוואה** - מספר זיהוי (להתעלם)
5. **שחרור במנה/מנות** - מנה אחת או מנות (להתעלם)
6. **אופן תשלום** - לוח שפיצר (להתעלם)
7. **שיעור ריבית שנתית** - כאן יש שני מספרים:
   - **מתואמת X.XX%** ← קח את זה!
   - נומינלית X.XX%
8. **ריבית משתנה: מנגנון קביעת הריבית** - ריבית בסיס ותוספת/הפחתה (למשל P-0.70%, H+2.85%)
9. **הריבית הכוללת החזויה** - ריבית משוקללת של כל התמהיל (בעמודת סה"כ)
10. **סכום ההחזר החודשי** - ההחזר לחודש ראשון

## סוגי מסלולים - מיפוי מדויק

| מה כתוב במסמך | type |
|---------------|------|
| פריים / פריים דיור / פריים דיור - דיור / ריבית משתנה על בסיס פריים | prime |
| קבועה לא צמודה / ריבית קבועה לא צמודה / קבועה לא צמודה - דיור / קבועה לא צמודה בחלקים | fixed_unlinked |
| קבועה צמודה / צמודה - דיור / ריבית קבועה צמודה / צמודה למדד | fixed_linked |
| משתנה לא צמודה / משתנה לא צמודה כל X שנים / 2 + 2 משתנה לא צמודה / משתנה על בסיס אג"ח / משתנה כל שנה / מק"מ | variable_unlinked |
| משתנה צמודה / משתנה צמודה למדד / משתנה צמודה כל X שנים | variable_linked |

## דוגמאות מפלט צפוי

### דוגמה 1 - מסמך עם 3 מסלולים:
סה"כ: 1,200,000
- מסלול 1: משתנה לא צמודה 2+2, 320,000 ש"ח, 360 חודשים, מתואמת 4.44%
- מסלול 2: פריים דיור, 479,000 ש"ח, 360 חודשים, מתואמת 4.91%
- מסלול 3: קבועה לא צמודה, 401,000 ש"ח, 240 חודשים, מתואמת 4.54%

### דוגמה 2 - מסמך עם 3 מסלולים:
סה"כ: 750,000
- מסלול 1: ריבית קבועה לא צמודה, 300,000 ש"ח, 300 חודשים, מתואמת 4.75%
- מסלול 2: משתנה 2+2 צמודה למדד, 300,000 ש"ח, 312 חודשים, מתואמת 4.70%
- מסלול 3: פריים דיור, 150,000 ש"ח, 300 חודשים, מתואמת 4.80%

### דוגמה 3 - מסמך עם 4 מסלולים:
סה"כ: 1,200,000
- מסלול 1: קבועה לא צמודה, 320,000 ש"ח, 360 חודשים, מתואמת 4.44%
- מסלול 2: פריים דיור, 479,000 ש"ח, 360 חודשים, מתואמת 4.91%
- מסלול 3: קבועה לא צמודה, 401,000 ש"ח, 240 חודשים, מתואמת 4.54%
- מסלול 4 (אם קיים)

## כללים קריטיים

1. **ריבית מתואמת בלבד** - תמיד קח את הריבית המתואמת, לא הנומינלית, לא ריבית הבסיס
2. **הריבית המתואמת** מופיעה בשורה "שיעור ריבית שנתית" - המספר הראשון עם הסימן %
3. **אם כתוב "מתואמת X.XX%"** - קח את X.XX
4. **אם יש רק מספר אחד** בשורת הריבית - זו המתואמת
5. **סכומים** - הסר פסיקים, קח את המספר השלם
6. **תקופה** - המספר בחודשים (לא שנים)
7. **זהה את כל המסלולים** - לרוב 3, לפעמים 2 או 4
8. **החזר חודשי** - אם יש מספר בשורה "סכום ההחזר החודשי" - קח אותו

## פורמט התשובה

החזר JSON בלבד, ללא טקסט נוסף:

{
  "totalAmount": number,
  "tracks": [
    {
      "type": "prime" | "fixed_unlinked" | "fixed_linked" | "variable_unlinked" | "variable_linked",
      "amount": number,
      "periodMonths": number,
      "effectiveRate": number,
      "monthlyPayment": number | null
    }
  ],
  "totalMonthlyPayment": number | null,
  "overallRate": number | null,
  "extractionConfidence": "high" | "medium" | "low"
}

אם לא מצליח לזהות שדה - שים null.
אם לא בטוח - שים extractionConfidence: "low".

החזר JSON בלבד.`;


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.CLAUDE_API_KEY) {
    console.error('CLAUDE_API_KEY not configured');
    return res.status(500).json({ error: 'שגיאת הגדרות שרת - חסר API Key' });
  }

  try {
    const { fileBase64, fileType, mediaType } = req.body;
    
    if (!fileBase64 || !fileType) {
      return res.status(400).json({ error: 'חסר קובץ' });
    }
    
    const result = await extractMortgage(fileBase64, fileType, mediaType);
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Extraction error:', error);
    return res.status(500).json({ 
      error: 'שגיאה בעיבוד המסמך',
      message: error.message
    });
  }
}


async function extractMortgage(fileBase64, fileType, mediaType) {
  const contentBlock = fileType === 'pdf'
    ? {
        type: 'document',
        source: {
          type: 'base64',
          media_type: mediaType || 'application/pdf',
          data: fileBase64
        }
      }
    : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType || 'image/jpeg',
          data: fileBase64
        }
      };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            { type: 'text', text: EXTRACTION_PROMPT }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Claude API error:', error);
    throw new Error(error.error?.message || 'Claude API error');
  }

  const data = await response.json();
  const jsonText = data.content[0].text;
  
  console.log('Raw Claude response:', jsonText);
  
  // נקה את התשובה
  let cleanJson = jsonText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // נסה למצוא JSON בתוך הטקסט אם יש טקסט מסביב
  const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanJson = jsonMatch[0];
  }
  
  try {
    const extracted = JSON.parse(cleanJson);
    return validateAndEnrich(extracted);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Attempted to parse:', cleanJson);
    throw new Error('שגיאה בפענוח תשובת AI');
  }
}


function validateAndEnrich(data) {
  const result = { ...data, warnings: [] };
  
  // וודא שיש tracks
  if (!result.tracks || result.tracks.length === 0) {
    throw new Error('לא זוהו מסלולים במסמך');
  }
  
  // חשב אחוז מהתמהיל
  result.tracks = result.tracks.map(track => ({
    ...track,
    percentOfMix: result.totalAmount > 0 
      ? Math.round((track.amount / result.totalAmount) * 100)
      : 0
  }));
  
  // וודא סכומים
  const sumAmounts = result.tracks.reduce((sum, t) => sum + (t.amount || 0), 0);
  if (result.totalAmount && Math.abs(sumAmounts - result.totalAmount) > 5000) {
    result.warnings.push('סכום המסלולים לא תואם לסה"כ');
    // תקן את הסה"כ אם חסר
    if (!result.totalAmount) {
      result.totalAmount = sumAmounts;
    }
  }
  
  // וודא ריביות הגיוניות
  const rateRanges = {
    prime: { min: 3, max: 9 },
    fixed_unlinked: { min: 3, max: 9 },
    fixed_linked: { min: 2, max: 7 },
    variable_unlinked: { min: 2.5, max: 8 },
    variable_linked: { min: 2, max: 7 }
  };
  
  result.tracks.forEach(track => {
    if (track.effectiveRate) {
      const range = rateRanges[track.type] || { min: 2, max: 10 };
      if (track.effectiveRate < range.min || track.effectiveRate > range.max) {
        result.warnings.push(`ריבית ${track.effectiveRate}% במסלול ${track.type} - לבדוק`);
      }
    }
  });
  
  // חשב החזר חודשי כולל אם חסר
  if (!result.totalMonthlyPayment) {
    result.totalMonthlyPayment = result.tracks.reduce((sum, t) => sum + (t.monthlyPayment || 0), 0);
  }
  
  return result;
}
