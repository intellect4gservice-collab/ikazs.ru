<?php
// ОБРАЗЕЦ. Настоящий order-config.php в git не хранится: его создаёт деплой (.github/workflows/deploy.yml)
// из секретов репозитория TG_TOKEN и TG_CHAT_ID. Для ручной заливки - скопировать в order-config.php и вписать значения.
return [
  'tg_token'   => 'ВСТАВЬ_ТОКЕН_БОТА',
  'tg_chat_id' => 'ВСТАВЬ_CHAT_ID',
  'email_to'   => 'intellect4gservice@gmail.com',
  'email_from' => 'no-reply@ikazs.ru',
  'rate_limit' => 5,
];
