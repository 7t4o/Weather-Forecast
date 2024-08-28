function getSimpleLocation() { //طلب الوصول الى الموقع
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        position => {
            get(position.coords.latitude, position.coords.longitude)
        },
        error => {
            console.log(`حدث خطأ: ${error.message}`);
        }
        );
    } else {
        console.log("الجيولوكيشن غير مدعوم في هذا المتصفح.");
    }
}

async function get(lat, lon) { // جلب البيانات
    const loadingSpinner = document.getElementsByClassName('preItems')[0];

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=ar&appid=ade96dcdc1c817fafa0dc00d90c518db&units=metric`);
        const data = await response.json();

        loadingSpinner.style.display = 'none';
        let cityName = await getCityName(lat, lon); // نستخدم await لان الدالة ترجع Promise
        for(let i=0; i<5; i++){
            let weather = getWeatherTranslate(data.list[i*8].weather[0].main); // الوصول الى حالة الطقس في كل الايام
            let weatherDetails = data.list[i*8].weather[0].description
            let date = data.list[i*8].dt_txt //جلب تاريخ كل يوم
            let day = getDayOfWeek(date.match(/^\S+/)[0])
            let temp = data.list[i*8].main.temp
            let icon = data.list[i*8].weather[0].icon

            statusDay(day, weather, temp.toFixed(1), icon.slice(0,2), weatherDetails, cityName)
        }
    }
    catch(e){
        console.log(`Error: ${e}`)
    }
    finally {
        
    }
}

function getDayOfWeek(dateString) { //تحديد ايام الاسبوم من التاريخ
    const daysInArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const date = new Date(dateString);
    return daysInArabic[date.getDay()];
}

function getWeatherTranslate(weather) { // ترجمة الكلمات الانجليزية
    let translate = {
        "Thunderstorm" : "بروق",
        "Drizzle" : "مطر خفيف",
        "Rain" : "مطر",
        "Snow" : "ثلوج",
        "Clear" : "سماء صافية",
        "Clouds" : "غيوم"
    };

    return translate[weather] ? translate[weather] : weather;
}

async function getCityName(latitude, longitude) { // جلب اسم المدينة من خلال الاحداثيات
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
      // استخراج اسم المدينة من البيانات المُرجعة
        const city = data.address.city || data.address.town || data.address.village || 'غير معروف';
        
        return city;
    } catch (error) {
        console.error('حدث خطأ أثناء جلب اسم المدينة:', error);
        return 'غير معروف';
    }
}

function statusDay(day, weather, temp, icon, weatherDetails, cityName){ // أنشاء البطايق
    let main = document.querySelector("main");
    let p = document.querySelector(".title p");
    main.innerHTML += `
            <div class="day">
                <h3 class="weekDay">${day}</h3>
                <img src="image/${icon}.png" alt="icon" class="icon">
                <h4 class="weatherDes">${weather}</h4>
                <h4 class="temp">${temp}°</h4>
                <p>توقعات الطقس تشير الى حالة ${weatherDetails} مع درجة حرارة ${temp}° مئوية</p>
            </div>`
    p.innerHTML = `(${cityName})`
}

getSimpleLocation()

let btn = document.querySelector(".preItems button");
btn.addEventListener('click', getSimpleLocation);