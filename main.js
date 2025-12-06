// main.js

// 讀取 Spotify churn 資料
d3.csv("spotify_churn_dataset.csv").then(res => {

    console.log("資料讀取成功，共 " + res.length + " 筆");

    // --- Step 1：建立年齡區間分組 ---
    function getAgeGroup(age) {
        age = +age; // 轉數字
        if (age < 20) return "10–19";
        if (age < 30) return "20–29";
        if (age < 40) return "30–39";
        if (age < 50) return "40–49";
        return "50+";
    }

    // 用物件記錄各年齡層 sum / count
    let groups = {};

    res.forEach(row => {
        let age = row.age;
        let listen = row.listening_time;

        if (!age || !listen) return;

        let group = getAgeGroup(age);

        if (!groups[group]) {
            groups[group] = { sum: 0, count: 0 };
        }

        groups[group].sum += parseFloat(listen);
        groups[group].count += 1;
    });

    // --- Step 2：整理成 x / y ---
    let x = ["10–19", "20–29", "30–39", "40–49", "50+"];
    let y = x.map(g => (groups[g].sum / groups[g].count));

    // --- Step 3：Plotly trace ---
    let trace = {
        type: "scatter",
        mode: "lines+markers+text",
        line: {
            shape: "spline",
            width: 4,
            color: "#1DB954"
        },
        marker: {
            size: 12,
            color: "#1DB954",
            line: { width: 2, color: "#ffffff" }
        },
        name: "Average Listening Time",
        x: x,
        y: y,
        text: y.map(v => v.toFixed(1)),
        textposition: "top center"
    };

    // --- Step 4：layout 設定 ---
    let layout = {
        title: "不同年齡層的平均聽歌時間",
        xaxis: { title: "年齡區間（Age Group）" },
        yaxis: { title: "平均聽歌時間（Average Listening Time, minutes）" },
        margin: { t: 50 },
        showlegend: true,
    };

    // --- Step 5：畫圖 ---
    Plotly.newPlot("myGraph", [trace], layout);

    // --- Chart 2: 跳歌率折線圖 ---
    let skipRateGroup = {};

    res.forEach(row => {
        let age = row.age;
        let skip = parseFloat(row.skip_rate);
        if (!age || isNaN(skip)) return;

        let g = getAgeGroup(age);
        if (!skipRateGroup[g]) skipRateGroup[g] = { sum: 0, count: 0 };

        skipRateGroup[g].sum += skip;
        skipRateGroup[g].count += 1;
    });

    let skipLineY = x.map(g => skipRateGroup[g].sum / skipRateGroup[g].count);

    let trace_skip2 = {
        type: "scatter",
        name: "Skip Rate",
        mode: "lines+markers",
        line: {
            shape: "spline",
            width: 4,
            color: "#1ed760"
        },
        marker: {
            size: 10,
            color: "#1ed760",
            line: { width: 2, color: "#ffffff" }
        },
        x: x,
        y: skipLineY,
    };

    Plotly.newPlot("myGraph2", [trace_skip2], {
        title: "Average Skip Rate by Age Group (Line Chart)",
        xaxis: { title: "年齡區間（Age Group）" },
        yaxis: { title: "平均跳歌率（Average Skip Rate）" },
        showlegend: true
    });


    // --- Chart 3: 各年齡層平均每日聽歌次數（折線圖） ---
    let songsGroup = {};

    res.forEach(row => {
        let age = row.age;
        let songs = parseFloat(row.songs_played_per_day);
        if (!age || isNaN(songs)) return;

        let g = getAgeGroup(age);
        if (!songsGroup[g]) songsGroup[g] = { sum: 0, count: 0 };

        songsGroup[g].sum += songs;
        songsGroup[g].count += 1;
    });

    let songsY = x.map(g => songsGroup[g].sum / songsGroup[g].count);

    let trace_songs_line = {
        type: "scatter",
        name: "Songs Per Day",
        mode: "lines+markers",
        line: {
            shape: "spline",
            width: 4,
            color: "#1DB9A6"
        },
        marker: {
            size: 10,
            color: "#1DB9A6",
            line: { width: 2, color: "#ffffff" }
        },
        x: x,
        y: songsY,
    };

    Plotly.newPlot("myGraph3", [trace_songs_line], {
        title: "Average Songs Played Per Day by Age Group",
        xaxis: { title: "年齡區間（Age Group）" },
        yaxis: { title: "平均每日播放次數（Average Songs Played per Day）" },
        showlegend: true
    });



    // --- Chart 5: 訂閱方案 vs 平均聽歌時間（折線圖） ---
    let subListen = {};
    const subOrder = ["Free", "Premium", "Student", "Family"];

    res.forEach(row => {
        let sub = row.subscription_type;
        let listen = parseFloat(row.listening_time);
        if (!sub || isNaN(listen)) return;

        if (!subListen[sub]) subListen[sub] = { sum: 0, count: 0 };
        subListen[sub].sum += listen;
        subListen[sub].count += 1;
    });

    let subX = subOrder.filter(s => subListen[s]);
    let subY = subX.map(s => subListen[s].sum / subListen[s].count);

    let trace_sub_listen = {
        type: "scatter",
        name: "Listening Time",
        mode: "lines+markers",
        line: { shape: "spline", width: 4, color: "#1db954" },
        marker: { size: 10, color: "#1db954", line: { width: 2, color: "#ffffff" } },
        x: subX,
        y: subY,
    };

    Plotly.newPlot("myGraph5", [trace_sub_listen], {
        title: "Average Listening Time by Subscription Type",
        xaxis: { title: "訂閱方案（Subscription Type）" },
        yaxis: { title: "平均聽歌時間（minutes）" },
        showlegend: true
    });


    // --- Chart 6: 年齡層 vs 每週廣告次數（折線圖） ---
    let adsGroup = {};

    res.forEach(row => {
        let age = row.age;
        let ads = parseFloat(row.ads_listened_per_week);
        if (!age || isNaN(ads)) return;

        let g = getAgeGroup(age);
        if (!adsGroup[g]) adsGroup[g] = { sum: 0, count: 0 };

        adsGroup[g].sum += ads;
        adsGroup[g].count += 1;
    });

    let adsY = x.map(g => adsGroup[g].sum / adsGroup[g].count);

    let trace_ads = {
        type: "scatter",
        name: "Ads per Week",
        mode: "lines+markers",
        line: { shape: "spline", width: 4, color: "#ffb703" },
        marker: { size: 10, color: "#ffb703", line: { width: 2, color: "#ffffff" } },
        x: x,
        y: adsY,
    };

    Plotly.newPlot("myGraph6", [trace_ads], {
        title: "Average Ads Listened per Week by Age Group",
        xaxis: { title: "年齡區間（Age Group）" },
        yaxis: { title: "平均廣告次數（Ads per Week）" },
        showlegend: true
    });


    // --- Chart 7: 年齡層 vs 離線播放使用率（折線圖） ---
    let offlineGroup = {};

    res.forEach(row => {
        let age = row.age;
        let off = parseFloat(row.offline_listening);
        if (!age || isNaN(off)) return;

        let g = getAgeGroup(age);
        if (!offlineGroup[g]) offlineGroup[g] = { sum: 0, count: 0 };

        offlineGroup[g].sum += off;
        offlineGroup[g].count += 1;
    });

    let offY = x.map(g => offlineGroup[g].sum / offlineGroup[g].count);

    let trace_offline = {
        type: "scatter",
        name: "Offline Listening",
        mode: "lines+markers",
        line: { shape: "spline", width: 4, color: "#8ecae6" },
        marker: { size: 10, color: "#8ecae6", line: { width: 2, color: "#ffffff" } },
        x: x,
        y: offY,
    };

    Plotly.newPlot("myGraph7", [trace_offline], {
        title: "Average Offline Listening by Age Group",
        xaxis: { title: "年齡區間（Age Group）" },
        yaxis: { title: "離線播放使用率（Offline Listening Rate）" },
        showlegend: true
    });



    // --- Chart 9: 國家 vs 平均聽歌時間（折線圖, 前 10 名） ---
    let countryListen = {};

    res.forEach(row => {
        let c = row.country;
        let listen = parseFloat(row.listening_time);
        if (!c || isNaN(listen)) return;

        if (!countryListen[c]) countryListen[c] = { sum: 0, count: 0 };
        countryListen[c].sum += listen;
        countryListen[c].count += 1;
    });

    let sortedCountries = Object.keys(countryListen)
        .sort((a,b) => countryListen[b].count - countryListen[a].count)
        .slice(0, 10);

    let countryY = sortedCountries.map(c => countryListen[c].sum / countryListen[c].count);

    let trace_country = {
        type: "scatter",
        name: "Listening Time",
        mode: "lines+markers",
        line: { shape: "spline", width: 4, color: "#ffb703" },
        marker: { size: 10, color: "#ffb703", line: { width: 2, color: "#ffffff" }},
        x: sortedCountries,
        y: countryY,
    };

    Plotly.newPlot("myGraph9", [trace_country], {
        title: "Top 10 Countries — Average Listening Time",
        xaxis: { title: "國家（Country）" },
        yaxis: { title: "平均聽歌時間（minutes）" },
        showlegend: true
    });



    // --- Chart 10: 裝置類型 vs 聽歌時間（折線圖） ---
    let deviceListen = {};

    res.forEach(row => {
        let d = row.device_type;
        let listen = parseFloat(row.listening_time);
        if (!d || isNaN(listen)) return;

        if (!deviceListen[d]) deviceListen[d] = { sum: 0, count: 0 };
        deviceListen[d].sum += listen;
        deviceListen[d].count += 1;
    });

    let deviceX = Object.keys(deviceListen);
    let deviceY = deviceX.map(d => deviceListen[d].sum / deviceListen[d].count);

    let trace_device = {
        type: "scatter",
        name: "Listening Time",
        mode: "lines+markers",
        line: { shape: "spline", width: 4, color: "#8ecae6" },
        marker: { size: 10, color: "#8ecae6", line: { width: 2, color: "#ffffff" }},
        x: deviceX,
        y: deviceY,
    };

    Plotly.newPlot("myGraph10", [trace_device], {
        title: "Average Listening Time by Device Type",
        xaxis: { title: "裝置類型（Device Type）" },
        yaxis: { title: "平均聽歌時間（minutes）" },
        showlegend: true
    });

});