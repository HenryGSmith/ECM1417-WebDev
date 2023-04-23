<?php
$data = false;
function saveFormData($post)
{
    $keys = implode('-;-', array_keys($post));
    $vals = implode('-;-', array_values($post));
    $data = "$keys:;:$vals";

    $expire = time() + 86400 * 30; //30 days 
    setcookie('data', $data, $expire, '/');
}
function getFormData()
{
    if (!isset($_COOKIE['data'])) {
        return false;
    }
    $data = explode(':;:', $_COOKIE['data']);
    $keys = explode('-;-', $data[0]);
    $vals = explode('-;-', $data[1]);
    return array_combine($keys, $vals);
}
function saveDataInSession()
{
    $data = getFormData();
    if ($data === false) {
        $_SESSION["registered"] = false;
    } else {
        $_SESSION["registered"] = true;
        $_SESSION["body"] = $data["body-radio"];
        $_SESSION["eyes"] = $data["eyes-radio"];
        $_SESSION["mouth"] = $data["mouth-radio"];
    }
}
?>