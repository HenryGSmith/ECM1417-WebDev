<?php
include('./cookieManagement.php');

session_start();
if (!isset($_SESSION['registered'])) {
  saveDataInSession();
}
?>

<html lang='zxx'>

<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title> ECM1417 </title>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css' rel='stylesheet'
    integrity='sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD' crossorigin='anonymous'>
  <link rel='stylesheet' type='text/css' href='./Style.css'>
</head>

<body>
  <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js'
    integrity='sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN'
    crossorigin='anonymous'></script>

  <?php include './navMenu.php' ?>
  <div id='main'>
    <div class='registration' id='reg-form'>
      <?php
      if ($_SESSION['registered']) {
        echo ('<h1>Update Profile</h1>');
      } else {
        echo ('<h1>Register</h1>');
      }
      ?>
      <form action='./processPost.php' method='post'>
        <div class='form-group'>
          <label for='username'>username / nickname</label>
          <input name='username' class='form-control form-control-lg' type='text' placeholder='Username' <?php
            if($_SESSION['registered']){
              echo('value='.$_SESSION['username']);
            }
          ?> id='username-input'>
          <small id='username-error' class='form-text text-muted red'></small>
        </div>

        <div class='avatar-container' >
          <img class='avatar-image-1' id='layer-1' src='./emojiAssets/body/green.png' width='100%' />
          <img class='avatar-image-2' id='layer-2' src='./emojiAssets/eyes/closed.png' width='100%' />
          <img class='avatar-image-3' id='layer-3' src='./emojiAssets/mouth/open.png' width='100%' />
        </div>

        <div class='form-group tab-group'>
          <div class='tab'>
            <button type='button' class='tablinks button' onclick='openTab(event, "body")'
              id='default-open'>body</button>
            <button type='button' class='tablinks button' onclick='openTab(event, "eyes")'>eyes</button>
            <button type='button' class='tablinks button' onclick='openTab(event, "mouth")'>mouth</button>
          </div>

          <div id='body' class='tabcontent'>
            <input class='btn-check' type='radio' name='body_radio' id='body-radio-1' value='1' checked
              onclick='changeLayer(1, "./emojiAssets/body/green.png")'>
            <label class='btn btn-primary' for='body-radio-1'><img src='.\emojiAssets\body\green.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='body_radio' id='body-radio-2' value='2'
              onclick='changeLayer(1, "./emojiAssets/body/red.png")'>
            <label class='btn btn-primary' for='body-radio-2'><img src='.\emojiAssets\body\red.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='body_radio' id='body-radio-3' value='3'
              onclick='changeLayer(1, "./emojiAssets/body/yellow.png")'>
            <label class='btn btn-primary' for='body-radio-3'><img src='.\emojiAssets\body\yellow.png'
                width='40' /></label>
          </div>

          <div id='eyes' class='tabcontent'>
            <input class='btn-check' type='radio' name='eyes_radio' id='eyes-radio-1' value='1' checked
              onclick='changeLayer(2, "./emojiAssets/eyes/closed.png")'>
            <label class='btn btn-primary' for='eyes-radio-1'><img src='.\emojiAssets\eyes\closed.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='eyes_radio' id='eyes-radio-2' value='2'
              onclick='changeLayer(2, "./emojiAssets/eyes/laughing.png")'>
            <label class='btn btn-primary' for='eyes-radio-2'><img src='.\emojiAssets\eyes\laughing.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='eyes_radio' id='eyes-radio-3' value='3'
              onclick='changeLayer(2, "./emojiAssets/eyes/long.png")'>
            <label class='btn btn-primary' for='eyes-radio-3'><img src='.\emojiAssets\eyes\long.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='eyes_radio' id='eyes-radio-4' value='4'
              onclick='changeLayer(2, "./emojiAssets/eyes/normal.png")'>
            <label class='btn btn-primary' for='eyes-radio-4'><img src='.\emojiAssets\eyes\normal.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='eyes_radio' id='eyes-radio-5' value='5'
              onclick='changeLayer(2, "./emojiAssets/eyes/rolling.png")'>
            <label class='btn btn-primary' for='eyes-radio-5'><img src='.\emojiAssets\eyes\rolling.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='eyes_radio' id='eyes-radio-6' value='6'
              onclick='changeLayer(2, "./emojiAssets/eyes/winking.png")'>
            <label class='btn btn-primary' for='eyes-radio-6'><img src='.\emojiAssets\eyes\winking.png'
                width='40' /></label>
          </div>

          <div id='mouth' class='tabcontent'>
            <input class='btn-check' type='radio' name='mouth_radio' id='mouth-radio-1' value='1' checked
              onclick='changeLayer(3, "./emojiAssets/mouth/open.png")'>
            <label class='btn btn-primary' for='mouth-radio-1'><img src='.\emojiAssets\mouth\open.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='mouth_radio' id='mouth-radio-2' value='2'
              onclick='changeLayer(3, "./emojiAssets/mouth/sad.png")'>
            <label class='btn btn-primary' for='mouth-radio-2'><img src='.\emojiAssets\mouth\sad.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='mouth_radio' id='mouth-radio-3' value='3'
              onclick='changeLayer(3, "./emojiAssets/mouth/smiling.png")'>
            <label class='btn btn-primary' for='mouth-radio-3'><img src='.\emojiAssets\mouth\smiling.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='mouth_radio' id='mouth-radio-4' value='4'
              onclick='changeLayer(3, "./emojiAssets/mouth/straight.png")'>
            <label class='btn btn-primary' for='mouth-radio-4'><img src='.\emojiAssets\mouth\straight.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='mouth_radio' id='mouth-radio-5' value='5'
              onclick='changeLayer(3, "./emojiAssets/mouth/surprise.png")'>
            <label class='btn btn-primary' for='mouth-radio-5'><img src='.\emojiAssets\mouth\surprise.png'
                width='40' /></label>
            <input class='btn-check' type='radio' name='mouth_radio' id='mouth-radio-6' value='6'
              onclick='changeLayer(3, "./emojiAssets/mouth/teeth.png")'>
            <label class='btn btn-primary' for='mouth-radio-6'><img src='.\emojiAssets\mouth\teeth.png'
                width='40' /></label>
          </div>
        </div>

        <input class='btn btn-primary btn-lg btn-block' type='submit' value=<?php if ($_SESSION['registered']) {
          echo ('Update');
        } else {
          echo ('Register');
        } ?> id='submit-button' <?php if(!$_SESSION['registered']){echo('disabled');}?> />
      </form>
    </div>
  </div>
</body>

<script src='register.js'></script>

</html>