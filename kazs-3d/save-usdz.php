<?php
/* Кэш AR-файлов для iPhone: kazs-3d/usdz/<линейка>_<объем>_<цвет>.usdz
   Файл присылает сам виджет (собирает модель в браузере). Пишется один раз, перезаписать нельзя. */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
function out($c,$a){http_response_code($c);echo json_encode($a);exit;}
if(($_SERVER['REQUEST_METHOD']??'')!=='POST') out(405,['ok'=>false]);
$k=$_GET['k']??'';
$colors='0b0c0e|383c42|7d8084|eceef0|1b4fa0|a3141c|1f6a3c|5b3a24|e2621b|0f9a9a|f2a900';
if(!preg_match('/^(lux_(10|15|20)|premium_25)_('.$colors.')$/',$k)) out(422,['ok'=>false,'error'=>'key']);
$dir=__DIR__.'/usdz'; if(!is_dir($dir)) @mkdir($dir,0755,true);
$file=$dir.'/'.$k.'.usdz';
if(is_file($file) && filesize($file)>1000) out(200,['ok'=>true,'cached'=>true]);
$len=(int)($_SERVER['CONTENT_LENGTH']??0);
if($len<1000 || $len>40*1024*1024) out(413,['ok'=>false,'error'=>'size']);
$data=file_get_contents('php://input',false,null,0,40*1024*1024);
// USDZ = zip без сжатия, первым лежит .usda
if(strlen($data)<1000 || substr($data,0,4)!=="PK\x03\x04" || strpos(substr($data,0,200),'.usda')===false) out(422,['ok'=>false,'error'=>'format']);
$tmp=$file.'.'.bin2hex(random_bytes(4)).'.tmp';
if(@file_put_contents($tmp,$data)===false) out(500,['ok'=>false,'error'=>'write']);
@rename($tmp,$file); @chmod($file,0644);
out(200,['ok'=>true]);
