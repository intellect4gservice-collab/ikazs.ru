<?php
/* Приём заявок из 3D-витрины терминалов ИнтеллектКАЗС.
   Виджет шлёт сюда JSON (POST). Отсюда заявка уходит в Телеграм (бот) и на почту.
   Токен бота хранится только на сервере, в order-config.php. */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
function out($code,$arr){http_response_code($code);echo json_encode($arr,JSON_UNESCAPED_UNICODE);exit;}
if($_SERVER['REQUEST_METHOD']!=='POST') out(405,['success'=>false,'message'=>'POST only']);

$cfg=require __DIR__.'/order-config.php';
$raw=file_get_contents('php://input',false,null,0,20000);
$d=json_decode($raw,true);
if(!is_array($d)) out(400,['success'=>false,'message'=>'bad json']);

// ловушка для ботов: скрытое поле должно быть пустым
if(!empty($d['_honey'])) out(200,['success'=>true]);

$clean=function($v,$max=200){$v=trim((string)$v);$v=preg_replace('/[\x00-\x1F\x7F]/u',' ',$v);return mb_substr($v,0,$max);};
$name=$clean($d['name']??'',120); $phone=$clean($d['phone']??'',40); $email=$clean($d['email']??'',120);
$model=$clean($d['model']??'',60); $color=$clean($d['color']??'',40);
$partner=$clean($d['partner']??'',80); $site=$clean($d['site']??'',200);
$kind=($d['kind']??'')==='kazs'?'КАЗС':'терминал';
if($name==='') out(422,['success'=>false,'message'=>'name']);
if(strlen(preg_replace('/\D/','',$phone))<10 && !filter_var($email,FILTER_VALIDATE_EMAIL)) out(422,['success'=>false,'message'=>'contact']);
if($email!=='' && !filter_var($email,FILTER_VALIDATE_EMAIL)) $email='';

// простой лимит по IP: не больше rate_limit заявок за 10 минут
$ip=$_SERVER['REMOTE_ADDR']??'0'; $lf=sys_get_temp_dir().'/ikazs_order_'.md5($ip);
$hits=array_filter(@json_decode(@file_get_contents($lf),true)?:[],fn($t)=>$t>time()-600);
if(count($hits)>=($cfg['rate_limit']??5)) out(429,['success'=>false,'message'=>'rate']);
$hits[]=time(); @file_put_contents($lf,json_encode(array_values($hits)));

$when=date('d.m.Y H:i');
$h=fn($s)=>htmlspecialchars($s,ENT_QUOTES,'UTF-8');
$tg="🟢 <b>Заявка на ".$kind."</b>\n".
    "<b>Модель:</b> ".$h($model)." · ".$h($color)."\n".
    "<b>ФИО:</b> ".$h($name)."\n".
    "<b>Телефон:</b> ".$h($phone?:'-')."\n".
    "<b>Почта:</b> ".$h($email?:'-')."\n".
    "<b>Партнёр:</b> ".$h($partner?:'прямой заход')."\n".
    "<b>Сайт:</b> ".$h($site?:'-')."\n".
    "<i>".$when."</i>";
$okTg=false;
if(!empty($cfg['tg_token']) && strpos($cfg['tg_token'],'ВСТАВЬ')===false){
  $ctx=stream_context_create(['http'=>['method'=>'POST','header'=>"Content-Type: application/json\r\n",'timeout'=>8,'ignore_errors'=>true,
    'content'=>json_encode(['chat_id'=>$cfg['tg_chat_id'],'text'=>$tg,'parse_mode'=>'HTML','disable_web_page_preview'=>true])]]);
  $r=@file_get_contents('https://api.telegram.org/bot'.$cfg['tg_token'].'/sendMessage',false,$ctx);
  $okTg=$r && (json_decode($r,true)['ok']??false);
}
$okMail=false;
if(!empty($cfg['email_to'])){
  $subj='Заявка на '.$kind.' '.$model.($partner?' от партнёра '.$partner:'').' - '.$name;
  $body="Модель: $model\nЦвет: $color\nФИО: $name\nТелефон: ".($phone?:'-')."\nПочта: ".($email?:'-').
        "\nПартнёр: ".($partner?:'прямой заход')."\nСайт: ".($site?:'-')."\nВремя: $when\n";
  $hdr="From: ".$cfg['email_from']."\r\nContent-Type: text/plain; charset=UTF-8\r\n".($email?"Reply-To: $email\r\n":'');
  $okMail=@mail($cfg['email_to'],'=?UTF-8?B?'.base64_encode($subj).'?=',$body,$hdr);
}
if($okTg||$okMail) out(200,['success'=>true,'tg'=>$okTg,'mail'=>$okMail]);
out(502,['success'=>false,'message'=>'delivery']);
