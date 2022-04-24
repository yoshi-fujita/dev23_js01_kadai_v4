let my_score = 0;
let machine_score = 0;
let aiko_my_hand = 0; // 直前にあいこになった時の自分の手
let my_hand = 0; // 最新の自分の手
let machine_hand = 0; // 最新のマシンの手
let aiko = 0; // 直前があいこの場合

let janken_count = new Array(3);
janken_count = [1, 1, 1]; // じゃんけんの最初の自分の手の記録（初期値 1 とする）
let aiko_count = new Array(3);
for(let y = 0; y < 3; y++) {
    aiko_count[y] = new Array(3).fill(1);
} // あいこになった時の手とあいこ後の自分の手の記録（初期値 1 とする）

function update_count(){
    if(aiko === 0){
        janken_count[my_hand]++;
        // console.log("janken", janken_count, "my hand = " ,my_hand);
        localStorage.setItem("janken_count", JSON.stringify(janken_count));
    } else{
        aiko_count[aiko_my_hand][my_hand]++;
        // console.log("aiko", aiko_count, "my hand = " ,my_hand, "aiko my hand", aiko_my_hand);
        localStorage.setItem("aiko_count", JSON.stringify(aiko_count));
    }
} // 自分の手のカウント履歴を記録

function decide_machine_hand(){
    let next_machine_hand;
    let gu_c;
    let choki_c;
    let pa_c;
    if(aiko === 0){
        gu_c = janken_count[0];
        choki_c = janken_count[1];
        pa_c = janken_count[2];
        // next_machine_hand = ( janken_count.indexOf(Math.max.apply(null, janken_count)) + 2 ) % 3;
        if( gu_c >= choki_c && gu_c >= pa_c ){
            next_machine_hand = ( gu_c + 2 ) % 3;
        } else if( gu_c < choki_c && choki_c >= pa_c ){
            next_machine_hand = ( choki_c + 2 ) % 3;
        } else{
            next_machine_hand = ( pa_c + 2 ) % 3;
        } // GitHub の公開版でエラーになる箇所の対策
        console.log(janken_count, "max=", janken_count.indexOf(Math.max.apply(null,janken_count)));
    } else{
        gu_c = aiko_count[machine_hand][0];
        choki_c = aiko_count[machine_hand][1];
        pa_c = aiko_count[machine_hand][2];
        // next_machine_hand = ( aiko_count[machine_hand].indexOf(Math.max.apply(null, aiko_count[machine_hand])) + 2 ) % 3;
        if( gu_c >= choki_c && gu_c >= pa_c ){
            next_machine_hand = ( gu_c + 2 ) % 3;
        } else if( gu_c < choki_c && choki_c >= pa_c){
            next_machine_hand = ( choki_c + 2 ) % 3;
        } else{
            next_machine_hand = ( pa_c + 2 ) % 3;
        } // GitHub の公開版でエラーになる箇所の対策
        console.log(aiko_count, "machine hand=", machine_hand, "aiko max=", aiko_count[machine_hand].indexOf(Math.max.apply(null,aiko_count[machine_hand])));
    } // カウント履歴に基づき、勝つ可能性の高い手を決める
    if(Math.floor(Math.random() * 4) > 0){
        next_machine_hand = Math.floor(Math.random() * 3);        
    } // 75% の確率で、ランダムに戻す（50% の確率で、マシンが勝つ可能性の高い手になる）
    return next_machine_hand;
} // 自分の手のカウント履歴を参照してマシンの次の手を決める

// 過去の対戦成績や自分の手の記録の読み込み

let previous_my_score = Number(localStorage.getItem("my_score"));
let previous_machine_score = Number(localStorage.getItem("machine_score"));
if(previous_my_score && previous_machine_score){
    my_score = previous_my_score;
    machine_score = previous_machine_score;
    janken_count = JSON.parse(localStorage.getItem("janken_count"));
    aiko_count = JSON.parse(localStorage.getItem("aiko_count"));
}

$("#buttons").hide(); // 最初、じゃんけんボタンは隠しておく

function sleep(msec) { // msec ミリ秒待つ
    return new Promise(function(resolve) {
       setTimeout(function() {resolve()}, msec);
    })
 }

async function delay(src, text, aiko_param, time) {
    await sleep(time);
    $("#image img").attr('src', src);
    $("#comment h1").html(text);
    if(aiko_param === 0){      
        $("#control").fadeIn(500);
        $("#comment h2").html(score());
        update_history();
    } else{
        $(".gu").fadeIn(500);
        $(".choki").fadeIn(500);
        $(".pa").fadeIn(500);   
    }
} // time ミリ秒待った上で、コメントとボタンの再表示を行う。あいことあいこでない場合で表示が異なる

async function audio_delay(audio_id, time) {
    await sleep(time);
    document.getElementById(audio_id).play();
} // time ミリ秒待った上で、音声の再生を行う

function score(){
    return "ボク 　 キミ<br> " + machine_score + " vs " + my_score;
} // 表示するスコアの文字列を作る

$("#control").on("click", function () {
    $("#control").fadeOut(500);
    $("#machine img").attr('src', 'image/janken_gu.png'); 
    $("#image img").attr('src', 'image/dance_shifuku3.png');
    $(".gu").fadeIn(500);
    $(".choki").fadeIn(500);
    $(".pa").fadeIn(500);  
    $("#buttons").fadeIn(500);
    $("#comment h1").html("じゃんけん");
    document.getElementById("jankenpon").play();
}); // スタート時のじゃんけんボタンを押された時の処理

$(".gu").on("click", function () {
    my_hand = 0;
    $(".choki").fadeOut(100);
    $(".pa").fadeOut(100);
});
$(".choki").on("click", function () {
    my_hand = 1;
    $(".pa").fadeOut(100);
    $(".gu").fadeOut(100);
});
$(".pa").on("click", function () {
    my_hand = 2;
    $(".gu").fadeOut(100);
    $(".choki").fadeOut(100);
});

$(".gu, .choki, .pa").on("click", function () {
    if(aiko === 0){
        $("#comment h1").html("ぽん");
    } else{
        $("#comment h1").html("しょ");
    }
    machine_hand = decide_machine_hand(); // マシンの手を決める
    if (machine_hand === 0) {
        $("#machine img").attr('src', 'image/janken_gu.png');
    } else if(machine_hand === 1){
        $("#machine img").attr('src', 'image/janken_choki.png');
    } else if(machine_hand === 2){
        $("#machine img").attr('src', 'image/janken_pa.png');
    }
    update_count();

    if(my_hand === (machine_hand+1)%3){
        delay('image/banzai_kids_boy1.png', "勝った〜!!", aiko = 0, 1000);
        audio_delay("yatta", 1000);
        machine_score += 1;
        localStorage.setItem("machine_score", machine_score);
    } else if(my_hand === (machine_hand+2)%3){
        delay('image/cry_naku_boy.png', "負けた〜!!", aiko = 0, 1000);
        audio_delay("maketa", 1000);
        my_score += 1;
        localStorage.setItem("my_score", my_score);
    }else{
        aiko_my_hand = my_hand;
        delay('image/dance_shifuku3.png', "あいこで", aiko = 1, 1000);
        audio_delay("aikodesho", 1500);
    }
});

// video capture

$("#canvas").hide(); // キャプチャ用の画像は非表示にする

const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
}).then(stream => {
    video.srcObject = stream;
    video.play()
}).catch(e => {
  console.log(e)
}) // 動画の入力と表示

function snapshot(){
    let videoElement = document.querySelector('video');
    let canvasElement = document.querySelector('canvas');
    let context = canvasElement.getContext('2d');

    context.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
    return canvasElement.toDataURL();
} // 最新画像をキャプチャ

let history = new Array; //  = new Object(); // 過去の対戦記録

if( localStorage.getItem("janken_history") != null ){
    history = JSON.parse(localStorage.getItem("janken_history"));
    while( history.length > 5 ){
        history.pop();
    }
    draw_history();
    history.unshift( history[0] );
} // 過去の対戦記録の読み込み

function update_history(){
    let snap = snapshot();
    let now = new Date();
    let text = score();
    let time = time_to_text(now);

    history[0] = { snap , time, text };
    draw_history();
    localStorage.setItem("janken_history", JSON.stringify(history));
} // ローカルストレージ上のストレージ上の履歴データを更新

function draw_history(){
    $("#list").empty();
    for( i=0; i<history.length; i++){
        let now = history[i].now;
        const html = `
        <tr>
            <div>
                <td><img src="${history[i].snap}"></td>
                <td>${history[i].text}</td>
                <td>${history[i].time}</td>
            </div>
        </tr>
        `;
        $("#list").append(html);
    }
} // 最新の結果と過去の対戦記録を表示

function time_to_text(now){
    return(now.getFullYear()+"年"+(now.getMonth()+1)+"月"+now.getDay()+"日<br>"+now.getHours()+"時"+now.getMinutes()+"分"+now.getSeconds()+"秒");
} // 時刻データをテキストの念月日時分秒に変換
