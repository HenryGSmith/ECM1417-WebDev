<?php
$data = false;
function saveFormData($post)
{
    $data = json_encode($post);
    $expire = time() + 86400 * 30; //30 days 
    setcookie('data', $data, $expire, '/');
}
function getFormData()
{
    if (!isset($_COOKIE['data'])) {
        return false;
    }
    $data = json_decode($_COOKIE['data'], false);
    return $data;
}
function saveDataInSession()
{
    $data = getFormData();
    if ($data === false) {
        $_SESSION["registered"] = false;
    } else {
        $_SESSION["registered"] = true;
        $_SESSION["body"] = $data->body_radio;
        $_SESSION["eyes"] = $data->eyes_radio;
        $_SESSION["mouth"] = $data->mouth_radio;
    }
}
?>