<?php
// Get JSON data from POST request
$json_data = $_POST['json_data'];

// Set file name and path
$file_name = 'gameData.json';
$file_path = './' . $file_name;

// Open file for writing
$file_handle = fopen($file_path, 'w');

// Write JSON data to file
if (fwrite($file_handle, $json_data) === FALSE) {
    echo "Error writing JSON data to file!";
} else {
    //echo "JSON file saved successfully!";
}

// Close file handle
fclose($file_handle);
?>