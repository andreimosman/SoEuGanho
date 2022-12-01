<?php

require_once '../vendor/autoload.php';

function autoload($class)
{
    $class = str_replace('\\', '/', $class);
    $file = __DIR__ . '/../lib/' . $class . '.php';
    if (file_exists($file)) {
        require_once($file);
    }
}

spl_autoload_register('autoload');
