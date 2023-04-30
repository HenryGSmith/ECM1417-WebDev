<?php
$json_data = $_POST['json_data'];
$file_path = './gameData.json';

if (file_put_contents($file_path, $json_data) === FALSE) {
    echo "Error writing JSON data to file";
} else {
    //echo "JSON file saved successfully!";
}
?>