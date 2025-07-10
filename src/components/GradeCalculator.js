import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calculator, Check, Moon, Sun, Globe, Download, Upload, Camera } from 'lucide-react';
import * as XLSX from 'xlsx';

const GradeCalculator = () => {
    const [system, setSystem] = useState(4);
    const [courses, setCourses] = useState(Array(5).fill().map((_, i) => ({
        id: i + 1,
        name: '',
        credits: 1,
        grade: '',
        score: '',
        selected: false
    })));
    const [previousCredits, setPreviousCredits] = useState('');
    const [previousGPA, setPreviousGPA] = useState('');
    const [previousPoints, setPreviousPoints] = useState('');
    const [inputType, setInputType] = useState('gpa');
    const [results, setResults] = useState({ semester: 0, cumulative: 0 });
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('ar');
    const resultsRef = useRef(null);
    const fileInputRef = useRef(null);

    // الترجمات
    const translations = {
        ar: {
            title: "حاسبة المعدل الجامعي",
            subtitle: "احسب معدلك الفصلي والتراكمي بسهولة",
            previousData: "البيانات السابقة",
            previousCredits: "عدد الساعات السابقة",
            cumulativeGPA: "المعدل التراكمي",
            cumulativePoints: "النقاط التراكمية (أكثر دقة)",
            system4: "نظام 4 نقاط",
            system5: "نظام 5 نقاط",
            courses: "المواد الدراسية",
            courseName: "اسم المادة",
            credits: "الساعات",
            grade: "التقدير",
            cumulative: "التراكمي",
            semester: "الفصلي",
            excellent: "ممتاز",
            veryGood: "جيد جداً",
            good: "جيد",
            pass: "مقبول",
            fail: "ضعيف",
            select: "اختر",
            score: "الدرجة",
            developer: "تطوير عبداللطيف الخنبشي",
            from: "من",
            statistics: "إحصائيات",
            totalCourses: "إجمالي المواد",
            selectedCourses: "المواد المحددة",
            totalCredits: "إجمالي الساعات",
            averageScore: "متوسط الدرجات",
            gpaChange: "تغير المعدل",
            gpaIncreased: "ارتفع",
            gpaDecreased: "انخفض",
            noChange: "لا تغيير",
            saveAsImage: "حفظ كصورة",
            exportExcel: "تصدير Excel",
            uploadExcel: "رفع Excel"
        },
        en: {
            title: "University GPA Calculator",
            subtitle: "Calculate your semester and cumulative GPA easily",
            previousData: "Previous Data",
            previousCredits: "Previous Credit Hours",
            cumulativeGPA: "Cumulative GPA",
            cumulativePoints: "Cumulative Points (More Accurate)",
            system4: "4-Point System",
            system5: "5-Point System",
            courses: "Courses",
            courseName: "Course Name",
            credits: "Credits",
            grade: "Grade",
            cumulative: "Cumulative",
            semester: "Semester",
            excellent: "Excellent",
            veryGood: "Very Good",
            good: "Good",
            pass: "Pass",
            fail: "Fail",
            select: "Select",
            score: "Score",
            course: "Course",
            developer: "Developed by Abdullatif Alkhanabshi",
            from: "out of",
            statistics: "Statistics",
            totalCourses: "Total Courses",
            selectedCourses: "Selected Courses",
            totalCredits: "Total Credits",
            averageScore: "Average Score",
            gpaChange: "GPA Change",
            gpaIncreased: "Increased",
            gpaDecreased: "Decreased",
            noChange: "No Change",
            saveAsImage: "Save as Image",
            exportExcel: "Export Excel",
            uploadExcel: "Upload Excel"
        }
    };

    const t = translations[language];

    // جداول الدرجات
    const gradeScales = useMemo(() => ({
        4: language === 'ar' ? {
            'أ+': 4.00, 'أ': 3.75, 'ب+': 3.50, 'ب': 3.00, 'ج+': 2.50,
            'ج': 2.00, 'د+': 1.50, 'د': 1.00, 'هـ': 0.00
        } : {
            'A+': 4.00, 'A': 3.75, 'B+': 3.50, 'B': 3.00, 'C+': 2.50,
            'C': 2.00, 'D+': 1.50, 'D': 1.00, 'F': 0.00
        },
        5: language === 'ar' ? {
            'أ+': 5.00, 'أ': 4.75, 'ب+': 4.50, 'ب': 4.00, 'ج+': 3.50,
            'ج': 3.00, 'د+': 2.50, 'د': 2.00, 'هـ': 0.00
        } : {
            'A+': 5.00, 'A': 4.75, 'B+': 4.50, 'B': 4.00, 'C+': 3.50,
            'C': 3.00, 'D+': 2.50, 'D': 2.00, 'F': 0.00
        }
    }), [language]);

    const grades = Object.keys(gradeScales[system]);

    // تحويل الدرجة الرقمية إلى حرفية
    const scoreToGrade = (score, system, lang) => {
        const numScore = parseFloat(score);
        if (isNaN(numScore)) return '';

        if (numScore >= 95) return lang === 'ar' ? 'أ+' : 'A+';
        if (numScore >= 90) return lang === 'ar' ? 'أ' : 'A';
        if (numScore >= 85) return lang === 'ar' ? 'ب+' : 'B+';
        if (numScore >= 80) return lang === 'ar' ? 'ب' : 'B';
        if (numScore >= 75) return lang === 'ar' ? 'ج+' : 'C+';
        if (numScore >= 70) return lang === 'ar' ? 'ج' : 'C';
        if (numScore >= 65) return lang === 'ar' ? 'د+' : 'D+';
        if (numScore >= 60) return lang === 'ar' ? 'د' : 'D';
        return lang === 'ar' ? 'هـ' : 'F';
    };

    // تحويل الدرجة الحرفية إلى رقمية
    const gradeToScore = (grade) => {
        const gradeMap = {
            'أ+': 95, 'A+': 95,
            'أ': 90, 'A': 90,
            'ب+': 85, 'B+': 85,
            'ب': 80, 'B': 80,
            'ج+': 75, 'C+': 75,
            'ج': 70, 'C': 70,
            'د+': 65, 'D+': 65,
            'د': 60, 'D': 60,
            'هـ': 50, 'F': 50
        };
        return gradeMap[grade] || '';
    };

    // إضافة مادة جديدة
    const addCourse = () => {
        const newId = Math.max(...courses.map(c => c.id)) + 1;
        setCourses([...courses, {
            id: newId,
            name: '',
            credits: 1,
            grade: '',
            score: '',
            selected: false
        }]);
    };

    // حذف مادة
    const removeCourse = (id) => {
        if (courses.length > 5) {
            setCourses(courses.filter(course => course.id !== id));
        }
    };

    // تحديث بيانات المادة
    const updateCourse = (index, field, value) => {
        const newCourses = [...courses];
        newCourses[index][field] = value;

        // إذا تم تحديث الدرجة الرقمية، حدث الدرجة الحرفية
        if (field === 'score') {
            newCourses[index].grade = scoreToGrade(value, system, language);
        }
        // إذا تم تحديث الدرجة الحرفية، حدث الدرجة الرقمية
        else if (field === 'grade') {
            newCourses[index].score = gradeToScore(value);
        }

        setCourses(newCourses);
    };

    // تبديل تحديد المادة
    const toggleCourse = (index) => {
        const newCourses = [...courses];
        newCourses[index].selected = !newCourses[index].selected;
        setCourses(newCourses);
    };

    // تبديل الوضع الليلي
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // تبديل اللغة
    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    // حساب المعدل
    const calculateGPA = useCallback(() => {
        const selectedCourses = courses.filter(course =>
            course.selected && course.grade && gradeScales[system][course.grade] !== undefined
        );

        let totalPoints = 0;
        let totalCredits = 0;

        selectedCourses.forEach(course => {
            const credits = parseFloat(course.credits);
            const gradePoints = gradeScales[system][course.grade];
            totalPoints += credits * gradePoints;
            totalCredits += credits;
        });

        const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

        let cumulativeGPA = semesterGPA;

        if (previousCredits) {
            const prevCredits = parseFloat(previousCredits);
            let prevTotalPoints = 0;

            if (inputType === 'gpa' && previousGPA) {
                prevTotalPoints = parseFloat(previousGPA) * prevCredits;
            } else if (inputType === 'points' && previousPoints) {
                prevTotalPoints = parseFloat(previousPoints);
            }

            if (prevCredits > 0) {
                const totalPrevPoints = prevTotalPoints + totalPoints;
                const totalPrevCredits = prevCredits + totalCredits;
                cumulativeGPA = totalPrevCredits > 0 ? totalPrevPoints / totalPrevCredits : 0;
            }
        }

        // حساب تغير المعدل
        let gpaChange = 0;
        let previousGPAValue = 0;
        if (previousCredits && ((inputType === 'gpa' && previousGPA) || (inputType === 'points' && previousPoints))) {
            const prevCredits = parseFloat(previousCredits);
            if (inputType === 'gpa' && previousGPA) {
                previousGPAValue = parseFloat(previousGPA);
            } else if (inputType === 'points' && previousPoints) {
                previousGPAValue = prevCredits > 0 ? parseFloat(previousPoints) / prevCredits : 0;
            }
            gpaChange = cumulativeGPA - previousGPAValue;
        }

        setResults({
            semester: semesterGPA,
            cumulative: cumulativeGPA,
            selectedCoursesCount: selectedCourses.length,
            totalCredits: totalCredits,
            averageScore: selectedCourses.length > 0 ?
                selectedCourses.reduce((sum, course) => sum + (parseFloat(course.score) || 0), 0) / selectedCourses.length : 0,
            gpaChange: gpaChange,
            previousGPA: previousGPAValue
        });
    }, [courses, previousCredits, previousGPA, previousPoints, inputType, system, gradeScales]);

    // حفظ النتائج كصورة
    const saveAsImage = async () => {
        if (!resultsRef.current) return;

        try {
            // إنشاء canvas من العنصر
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // تحديد أبعاد الصورة
            canvas.width = 800;
            canvas.height = 600;

            // رسم الخلفية
            ctx.fillStyle = darkMode ? '#1e293b' : '#ffffff';
            ctx.fillRect(0, 0, 800, 600);

            // رسم النص والمحتوى
            ctx.fillStyle = darkMode ? '#ffffff' : '#000000';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';

            const centerX = 400;
            let y = 80;

            // عنوان
            ctx.font = 'bold 24px Arial';
            ctx.fillText(t.title, centerX, y);
            y += 60;

            // النتائج
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`${t.semester}: ${results.semester.toFixed(2)}`, centerX, y);
            y += 40;
            ctx.fillText(`${t.cumulative}: ${results.cumulative.toFixed(2)}`, centerX, y);
            y += 60;

            // الإحصائيات
            ctx.font = '16px Arial';
            ctx.fillText(`${t.selectedCourses}: ${results.selectedCoursesCount || 0}`, centerX, y);
            y += 30;
            ctx.fillText(`${t.totalCredits}: ${results.totalCredits || 0}`, centerX, y);
            y += 30;
            ctx.fillText(`${t.averageScore}: ${results.averageScore ? results.averageScore.toFixed(1) : '0.0'}`, centerX, y);

            // تحويل إلى بيانات الصورة وتنزيلها
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `gpa-results-${new Date().toLocaleDateString()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error saving image:', error);
            alert(language === 'ar' ? 'حدث خطأ في حفظ الصورة' : 'Error saving image');
        }
    };

    // تصدير البيانات إلى Excel
    const exportToExcel = () => {
        try {
            // إعداد بيانات المواد
            const coursesData = courses.filter(course => course.selected).map(course => ({
                [language === 'ar' ? 'اسم المادة' : 'Course Name']: course.name || `${language === 'ar' ? 'المادة' : 'Course'} ${course.id}`,
                [language === 'ar' ? 'الساعات' : 'Credits']: course.credits,
                [language === 'ar' ? 'الدرجة الرقمية' : 'Numeric Score']: course.score || '',
                [language === 'ar' ? 'التقدير' : 'Grade']: course.grade || '',
                [language === 'ar' ? 'النقاط' : 'Points']: course.grade && gradeScales[system][course.grade] ?
                    (course.credits * gradeScales[system][course.grade]).toFixed(2) : ''
            }));

            // إعداد بيانات النتائج
            const resultsData = [{
                [language === 'ar' ? 'نوع البيانات' : 'Data Type']: language === 'ar' ? 'النتائج' : 'Results',
                [language === 'ar' ? 'المعدل الفصلي' : 'Semester GPA']: results.semester.toFixed(2),
                [language === 'ar' ? 'المعدل التراكمي' : 'Cumulative GPA']: results.cumulative.toFixed(2),
                [language === 'ar' ? 'نظام الدرجات' : 'GPA System']: system,
                [language === 'ar' ? 'عدد المواد' : 'Number of Courses']: results.selectedCoursesCount || 0,
                [language === 'ar' ? 'إجمالي الساعات' : 'Total Credits']: results.totalCredits || 0,
                [language === 'ar' ? 'متوسط الدرجات' : 'Average Score']: results.averageScore ? results.averageScore.toFixed(1) : '0.0'
            }];

            // إعداد البيانات السابقة
            const previousData = [{
                [language === 'ar' ? 'الساعات السابقة' : 'Previous Credits']: previousCredits || '',
                [language === 'ar' ? 'المعدل السابق' : 'Previous GPA']: inputType === 'gpa' ? previousGPA : '',
                [language === 'ar' ? 'النقاط السابقة' : 'Previous Points']: inputType === 'points' ? previousPoints : '',
                [language === 'ar' ? 'نوع الإدخال' : 'Input Type']: inputType
            }];

            // إنشاء المصنف
            const workbook = XLSX.utils.book_new();

            // إضافة أوراق العمل
            const coursesSheet = XLSX.utils.json_to_sheet(coursesData);
            const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
            const previousSheet = XLSX.utils.json_to_sheet(previousData);

            XLSX.utils.book_append_sheet(workbook, coursesSheet, language === 'ar' ? 'المواد' : 'Courses');
            XLSX.utils.book_append_sheet(workbook, resultsSheet, language === 'ar' ? 'النتائج' : 'Results');
            XLSX.utils.book_append_sheet(workbook, previousSheet, language === 'ar' ? 'البيانات السابقة' : 'Previous Data');

            // تنزيل الملف
            XLSX.writeFile(workbook, `gpa-data-${new Date().toLocaleDateString()}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert(language === 'ar' ? 'حدث خطأ في تصدير البيانات' : 'Error exporting data');
        }
    };

    // رفع ملف Excel وقراءة البيانات
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // قراءة بيانات المواد
                const coursesSheetName = workbook.SheetNames.find(name =>
                    name.includes('المواد') || name.includes('Courses')
                );

                if (coursesSheetName) {
                    const coursesSheet = workbook.Sheets[coursesSheetName];
                    const coursesData = XLSX.utils.sheet_to_json(coursesSheet);

                    if (coursesData.length > 0) {
                        const newCourses = coursesData.map((row, index) => ({
                            id: index + 1,
                            name: row[language === 'ar' ? 'اسم المادة' : 'Course Name'] || '',
                            credits: parseInt(row[language === 'ar' ? 'الساعات' : 'Credits']) || 1,
                            score: row[language === 'ar' ? 'الدرجة الرقمية' : 'Numeric Score'] || '',
                            grade: row[language === 'ar' ? 'التقدير' : 'Grade'] || '',
                            selected: true
                        }));

                        setCourses(newCourses);
                    }
                }

                // قراءة البيانات السابقة
                const previousSheetName = workbook.SheetNames.find(name =>
                    name.includes('البيانات السابقة') || name.includes('Previous Data')
                );

                if (previousSheetName) {
                    const previousSheet = workbook.Sheets[previousSheetName];
                    const previousDataArray = XLSX.utils.sheet_to_json(previousSheet);

                    if (previousDataArray.length > 0) {
                        const prevData = previousDataArray[0];
                        setPreviousCredits(prevData[language === 'ar' ? 'الساعات السابقة' : 'Previous Credits'] || '');
                        setInputType(prevData[language === 'ar' ? 'نوع الإدخال' : 'Input Type'] || 'gpa');

                        if (prevData[language === 'ar' ? 'المعدل السابق' : 'Previous GPA']) {
                            setPreviousGPA(prevData[language === 'ar' ? 'المعدل السابق' : 'Previous GPA']);
                            setInputType('gpa');
                        }

                        if (prevData[language === 'ar' ? 'النقاط السابقة' : 'Previous Points']) {
                            setPreviousPoints(prevData[language === 'ar' ? 'النقاط السابقة' : 'Previous Points']);
                            setInputType('points');
                        }
                    }
                }

                alert(language === 'ar' ? 'تم تحميل البيانات بنجاح!' : 'Data loaded successfully!');
            } catch (error) {
                console.error('Error reading Excel file:', error);
                alert(language === 'ar' ? 'حدث خطأ في قراءة الملف' : 'Error reading file');
            }
        };

        reader.readAsArrayBuffer(file);
        // إعادة تعيين input للسماح بتحميل نفس الملف مرة أخرى
        event.target.value = '';
    };

    useEffect(() => {
        calculateGPA();
    }, [calculateGPA]);

    const getGradeColor = (gpa) => {
        if (gpa >= 3.5) return darkMode ? 'text-green-400' : 'text-emerald-600';
        if (gpa >= 3.0) return darkMode ? 'text-sky-400' : 'text-blue-600';
        if (gpa >= 2.5) return darkMode ? 'text-yellow-400' : 'text-amber-600';
        if (gpa >= 2.0) return darkMode ? 'text-orange-400' : 'text-orange-600';
        return darkMode ? 'text-red-400' : 'text-red-600';
    };

    const getGradeText = (gpa) => {
        if (gpa >= 3.5) return t.excellent;
        if (gpa >= 3.0) return t.veryGood;
        if (gpa >= 2.5) return t.good;
        if (gpa >= 2.0) return t.pass;
        return t.fail;
    };

    const getThemeClasses = () => {
        if (darkMode) {
            return {
                bg: "bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800",
                card: "bg-slate-700/95 border-slate-600/70",
                text: "text-white",
                textSecondary: "text-slate-100",
                textMuted: "text-slate-300",
                input: "bg-slate-600/90 border-slate-500/70 text-white focus:border-blue-400 placeholder-slate-300",
                button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                selected: "bg-blue-700/80 border-blue-400",
                unselected: "bg-slate-600/50"
            };
        } else {
            return {
                bg: "bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50",
                card: "bg-white/70 border-white/30",
                text: "text-gray-800",
                textSecondary: "text-gray-700",
                textMuted: "text-gray-600",
                input: "bg-white/80 border-gray-200 text-gray-800 focus:border-blue-400 placeholder-gray-500",
                button: "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
                selected: "bg-blue-50/50 border-blue-200",
                unselected: "bg-gray-50/30"
            };
        }
    };

    const theme = getThemeClasses();

    return (
        <div className={`min-h-screen ${theme.bg} p-4 font-sans transition-all duration-500`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-md mx-auto">

                <div className="text-center mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 ${theme.button} rounded-xl`}>
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-2 ${theme.card} backdrop-blur-md rounded-xl shadow-lg border transition-all duration-200 flex items-center gap-3`}>
                                <span className={`text-sm font-semibold ${theme.text}`}>
                                    {language === 'ar' ? 'نظام المعدل' : 'GPA System'}
                                </span>
                                <button
                                    onClick={() => setSystem(system === 4 ? 5 : 4)}
                                    className="flex items-center gap-2 hover:scale-105 transition-all duration-200"
                                >
                                    <span className={`text-lg font-bold ${system === 4 ? 'text-blue-600' : 'text-purple-600'}`}>
                                        {system}
                                    </span>
                                    <div className={`w-10 h-5 ${system === 4 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full relative transition-all duration-300 shadow-inner`}>
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-md ${system === 4 ? 'left-0.5' : 'left-5'}`}></div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={toggleLanguage}
                                className={`p-2 ${theme.card} backdrop-blur-md rounded-xl shadow-lg border hover:scale-105 transition-all duration-200`}
                            >
                                <Globe className={`w-5 h-5 ${theme.text}`} />
                            </button>

                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 ${theme.card} backdrop-blur-md rounded-xl shadow-lg border hover:scale-105 transition-all duration-200`}
                            >
                                {darkMode ? (
                                    <Sun className={`w-5 h-5 ${theme.text}`} />
                                ) : (
                                    <Moon className={`w-5 h-5 ${theme.text}`} />
                                )}
                            </button>
                        </div>
                    </div>

                    <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2`}>
                        {t.title}
                    </h1>
                    <p className={`${theme.textMuted} text-sm`}>{t.subtitle}</p>
                </div>

                <div className={`${theme.card} backdrop-blur-md rounded-2xl p-5 shadow-xl border mb-5 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <h2 className={`text-lg font-bold ${theme.text}`}>{t.previousData}</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-semibold ${theme.textSecondary} mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                {t.previousCredits}
                            </label>
                            <input
                                type="number"
                                value={previousCredits}
                                onChange={(e) => setPreviousCredits(e.target.value)}
                                className={`w-full p-3 ${theme.input} border-2 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} focus:ring-4 focus:ring-blue-100 transition-all duration-200`}
                                placeholder={language === 'ar' ? "مثال: 60" : "Example: 60"}
                            />
                        </div>

                        <div className={`${darkMode ? 'bg-slate-600/60 border-slate-500/50' : 'bg-blue-50/30'} rounded-xl p-4 border ${darkMode ? '' : 'border-blue-100'}`}>
                            <div className="flex items-center gap-4 justify-center text-sm mb-4">
                                <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all ${inputType === 'gpa' ? (darkMode ? 'bg-blue-600/60 text-white' : 'bg-blue-100 text-blue-700') : (darkMode ? 'hover:bg-slate-500/50 text-white' : 'hover:bg-blue-50/50')}`}>
                                    <input
                                        type="radio"
                                        name="inputType"
                                        checked={inputType === 'gpa'}
                                        onChange={() => setInputType('gpa')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium">{t.cumulativeGPA}</span>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all ${inputType === 'points' ? (darkMode ? 'bg-purple-600/60 text-white' : 'bg-purple-100 text-purple-700') : (darkMode ? 'hover:bg-slate-500/50 text-white' : 'hover:bg-purple-50/50')}`}>
                                    <input
                                        type="radio"
                                        name="inputType"
                                        checked={inputType === 'points'}
                                        onChange={() => setInputType('points')}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="font-medium">{t.cumulativePoints}</span>
                                </label>
                            </div>

                            {inputType === 'gpa' ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={previousGPA}
                                    onChange={(e) => setPreviousGPA(e.target.value)}
                                    className={`w-full p-3 ${theme.input} border-2 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} focus:ring-4 focus:ring-blue-100 transition-all duration-200`}
                                    placeholder={language === 'ar' ? "مثال: 3.25" : "Example: 3.25"}
                                />
                            ) : (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={previousPoints}
                                    onChange={(e) => setPreviousPoints(e.target.value)}
                                    className={`w-full p-3 ${theme.input} border-2 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} focus:ring-4 focus:ring-purple-100 transition-all duration-200`}
                                    placeholder={language === 'ar' ? "مثال: 195.00" : "Example: 195.00"}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className={`${theme.card} backdrop-blur-md rounded-2xl p-5 shadow-xl border mb-5 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                        <h2 className={`text-lg font-bold ${theme.text}`}>{t.courses}</h2>
                    </div>

                    <div className={`grid grid-cols-6 gap-1 text-center font-bold ${theme.textSecondary} text-xs mb-4 pb-3 border-b-2 ${darkMode ? 'border-slate-500' : 'border-gray-200'}`}>
                        <div>✓</div>
                        <div>{t.courseName}</div>
                        <div>{t.credits}</div>
                        <div>{language === 'ar' ? 'الدرجة' : 'Score'}</div>
                        <div>{t.grade}</div>
                        <div></div>
                    </div>

                    <div className="space-y-3">
                        {courses.map((course, index) => (
                            <div key={course.id} className={`grid grid-cols-6 gap-1 items-center p-2 rounded-xl transition-all duration-200 ${course.selected ? theme.selected + ' border-2' : theme.unselected}`}>

                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => toggleCourse(index)}
                                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${course.selected
                                                ? `${theme.button} border-blue-500 text-white shadow-lg transform scale-110`
                                                : `${darkMode ? 'border-slate-400 hover:border-blue-400 hover:bg-blue-600/30' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`
                                            }`}
                                    >
                                        {course.selected && <Check className="w-3 h-3" />}
                                    </button>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={course.name}
                                        onChange={(e) => updateCourse(index, 'name', e.target.value)}
                                        className={`w-full p-1.5 ${theme.input} border rounded ${language === 'ar' ? 'text-right' : 'text-left'} text-xs focus:ring-1 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50`}
                                        placeholder={language === 'ar' ? `المادة ${course.id}` : `Course ${course.id}`}
                                        disabled={!course.selected}
                                    />
                                </div>

                                <div>
                                    <select
                                        value={course.credits}
                                        onChange={(e) => updateCourse(index, 'credits', parseInt(e.target.value))}
                                        className={`w-full p-1.5 ${theme.input} border rounded text-center text-xs focus:ring-1 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50`}
                                        disabled={!course.selected}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(credit => (
                                            <option key={credit} value={credit}>{credit}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={course.score}
                                        onChange={(e) => updateCourse(index, 'score', e.target.value)}
                                        className={`w-full p-1.5 ${theme.input} border rounded text-center text-xs focus:ring-1 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50`}
                                        placeholder="85"
                                        disabled={!course.selected}
                                    />
                                </div>

                                <div>
                                    <select
                                        value={course.grade}
                                        onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                                        className={`w-full p-1.5 ${theme.input} border rounded text-center text-xs focus:ring-1 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50`}
                                        disabled={!course.selected}
                                    >
                                        <option value="">{t.select}</option>
                                        {grades.map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-center">
                                    {courses.length > 5 && course.id > 5 && (
                                        <button
                                            onClick={() => removeCourse(course.id)}
                                            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                                            title={language === 'ar' ? 'حذف المادة' : 'Delete Course'}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-500 flex justify-center">
                        <button
                            onClick={addCourse}
                            className={`px-4 py-2 ${theme.button} text-white rounded-lg text-sm font-medium hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2`}
                        >
                            <span className="text-base">+</span>
                            {language === 'ar' ? 'إضافة مادة' : 'Add Course'}
                        </button>
                    </div>
                </div>

                <div ref={resultsRef} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">

                        <div className={`${theme.card} backdrop-blur-md rounded-2xl p-5 shadow-xl border text-center hover:shadow-2xl hover:scale-105 transition-all duration-300`}>
                            <div className="mb-4">
                                <div className="text-3xl mb-2">📊</div>
                                <h3 className={`text-lg font-bold ${theme.text}`}>{t.cumulative}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className={`text-3xl font-black ${getGradeColor(results.cumulative)}`}>
                                    {results.cumulative.toFixed(2)}
                                </div>
                                <div className={`text-xs ${theme.textMuted} font-medium`}>{t.from} {system}</div>
                                <div className={`text-sm font-semibold px-3 py-2 rounded-xl ${getGradeColor(results.cumulative)}`}>
                                    {getGradeText(results.cumulative)}
                                </div>
                            </div>
                        </div>

                        <div className={`${theme.card} backdrop-blur-md rounded-2xl p-5 shadow-xl border text-center hover:shadow-2xl hover:scale-105 transition-all duration-300`}>
                            <div className="mb-4">
                                <div className="text-3xl mb-2">📈</div>
                                <h3 className={`text-lg font-bold ${theme.text}`}>{t.semester}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className={`text-3xl font-black ${getGradeColor(results.semester)}`}>
                                    {results.semester.toFixed(2)}
                                </div>
                                <div className={`text-xs ${theme.textMuted} font-medium`}>{t.from} {system}</div>
                                <div className={`text-sm font-semibold px-3 py-2 rounded-xl ${getGradeColor(results.semester)}`}>
                                    {getGradeText(results.semester)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${theme.card} backdrop-blur-md rounded-2xl p-4 shadow-xl border hover:shadow-2xl transition-all duration-300`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                            <h3 className={`text-lg font-bold ${theme.text}`}>{t.statistics}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className={`${darkMode ? 'bg-green-700/50 border border-green-500/50' : 'bg-green-50/50'} rounded-xl p-3 text-center`}>
                                <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{results.selectedCoursesCount || 0}</div>
                                <div className={`text-xs ${theme.textMuted}`}>{t.selectedCourses}</div>
                            </div>

                            <div className={`${darkMode ? 'bg-purple-700/50 border border-purple-500/50' : 'bg-purple-50/50'} rounded-xl p-3 text-center`}>
                                <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{results.totalCredits || 0}</div>
                                <div className={`text-xs ${theme.textMuted}`}>{t.totalCredits}</div>
                            </div>

                            <div className={`${darkMode ? 'bg-orange-700/50 border border-orange-500/50' : 'bg-orange-50/50'} rounded-xl p-3 text-center`}>
                                <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {results.averageScore ? results.averageScore.toFixed(1) : '0.0'}
                                </div>
                                <div className={`text-xs ${theme.textMuted}`}>{t.averageScore}</div>
                            </div>

                            <div className={`${darkMode ? 'bg-sky-700/50 border border-sky-500/50' : 'bg-blue-50/50'} rounded-xl p-3 text-center`}>
                                {results.gpaChange !== undefined && results.previousGPA > 0 ? (
                                    <>
                                        <div className={`text-2xl font-bold ${results.gpaChange > 0 ? (darkMode ? 'text-green-400' : 'text-green-600') :
                                                results.gpaChange < 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-slate-300' : 'text-gray-600')
                                            }`}>
                                            {results.gpaChange > 0 ? '+' : ''}{results.gpaChange.toFixed(2)}
                                        </div>
                                        <div className={`text-xs ${theme.textMuted}`}>
                                            {results.gpaChange > 0 ? t.gpaIncreased :
                                                results.gpaChange < 0 ? t.gpaDecreased : t.noChange}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`text-2xl font-bold ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>--</div>
                                        <div className={`text-xs ${theme.textMuted}`}>{t.gpaChange}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 mb-8">
                    <button
                        onClick={saveAsImage}
                        className={`${theme.button} text-white py-3 px-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2`}
                    >
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">{language === 'ar' ? 'صورة' : 'Image'}</span>
                    </button>

                    <button
                        onClick={exportToExcel}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 px-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">{language === 'ar' ? 'تصدير' : 'Export'}</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 px-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{language === 'ar' ? 'رفع' : 'Upload'}</span>
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                <div className="text-center">
                    <div className={`${theme.card} backdrop-blur-md rounded-xl p-3 inline-block shadow-lg border`}>
                        <p className={`text-xs ${theme.textMuted} font-medium`}>{t.developer}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GradeCalculator;