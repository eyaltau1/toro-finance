# Toro Finance v2 - גרסה משופרת

## מה חדש בגרסה זו
- ✅ Prompt משופר עם דוגמאות ממסמכים אמיתיים
- ✅ זיהוי מדויק יותר של סוגי מסלולים
- ✅ תמיכה בכל פורמטי הטבלאות הנפוצים
- ✅ Error handling משופר עם לוגים
- ✅ אזהרות על ריביות חריגות

---

## העלאה מחדש ל-GitHub (מחק את הישן)

### שלב 1: מחק את ה-Repository הישן

1. לך ל-GitHub → לRepository שלך
2. **Settings** (למעלה מימין)
3. גלול עד למטה ל-**Danger Zone**
4. לחץ **Delete this repository**
5. אשר מחיקה

### שלב 2: צור Repository חדש

1. לך ל-[github.com/new](https://github.com/new)
2. **Repository name:** `toro-finance`
3. לחץ **Create repository**
4. לחץ **"uploading an existing file"**
5. גרור את כל התוכן מתיקייה זו:
   - 📁 `api/`
   - 📁 `public/`
   - 📄 `vercel.json`
   - 📄 `README.md`
6. לחץ **Commit changes**

### שלב 3: עדכן ב-Vercel

1. לך ל-[vercel.com](https://vercel.com) → Dashboard
2. מחק את הפרויקט הישן (שלוש נקודות → Delete)
3. לחץ **Add New** → **Project**
4. בחר את `toro-finance` החדש
5. **חשוב:** הוסף Environment Variable:
   - Name: `CLAUDE_API_KEY`
   - Value: המפתח שלך
6. לחץ **Deploy**

---

## בדיקה שהכל עובד

1. פתח את האתר
2. לחץ F12 → Console (לראות לוגים)
3. העלה מסמך משכנתא
4. בדוק שמופיעים הודעות כמו:
   - `Starting Claude AI extraction for: ...`
   - `Claude extraction result: {...}`

---

## אם עדיין לא עובד

### בעיה: "שגיאת הגדרות שרת"
**פתרון:** ה-API Key לא מוגדר ב-Vercel
1. Vercel → Project → Settings → Environment Variables
2. הוסף `CLAUDE_API_KEY`
3. לחץ **Redeploy**

### בעיה: "שגיאה בשרת"
**פתרון:** בדוק את הלוגים ב-Vercel
1. Vercel → Project → Deployments
2. לחץ על ה-deployment האחרון
3. לחץ **Functions** → ראה את השגיאות

### בעיה: "לא זוהו מסלולים"
**פתרון:** המסמך לא ברור מספיק
- נסה תמונה באיכות גבוהה יותר
- ודא שטבלת "סל מוצע" נראית בבירור
- נסה PDF במקום תמונה

---

## מבנה הפרויקט

```
toro-finance/
├── api/
│   └── analyze-mortgage.js   ← ה-Agent המשופר
├── public/
│   └── index.html            ← האתר עם logging
├── vercel.json
└── README.md
```
