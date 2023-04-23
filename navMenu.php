<?php
  $body = "./emojiAssets/body/";
  $eyes = "./emojiAssets/eyes/";
  $mouth = "./emojiAssets/mouth/";
if($_SESSION["registered"]){
  switch($_SESSION["body"]){
    case "1":
      $body .= "green.png";
      break;
    case "2":
      $body .= "red.png";
      break;
    case "3":
      $body .= "yellow.png";
      break;
  }
  switch($_SESSION["eyes"]){
    case 1:
      $eyes.= "closed.png";
      break;
    case 2:
      $eyes.= "laughing.png";
      break;
    case 3:
      $eyes.= "long.png";
      break;
    case 4:
      $eyes.= "normal.png";
      break;
    case 5:
      $eyes.= "rolling.png";
      break;
    case 6:
      $eyes.= "winking.png";
      break;
  }
  switch($_SESSION["mouth"]){
    case 1:
      $mouth.="open.png";
      break;
    case 2:
      $mouth.="sad.png";
      break;
    case 3:
      $mouth.="smiling.png";
      break;
    case 4:
      $mouth.="straight.png";
      break;
    case 5:
      $mouth.="surprise.png";
      break;
    case 6:
      $mouth.="teeth.png";
      break;
  }
}
?>

<nav class="navbar navbar-expand-lg sticky-top bg-primary navbar-dark" data-bs-theme="dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#"></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar"
      aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbar">
      <div class="navbar-nav">
        <a class="nav-item nav-link" href="/index.php" name="home">Home</a>
      </div>
      <div class="navbar-nav ms-auto align-items-center">
        <a class="nav-item nav-link" href="/pairs.php" name="memory">Play Pairs</a>
        <?php
        if ($_SESSION["registered"]) {
          echo "
          <a class='nav-item nav-link' href='/leaderboard.php' name='leaderboard'>Leaderboard</a>
          <a class='nav-item nav-link' href='/registration.php' name='profile'>
          <div class='avatar-container' margin='0px'>
            <img class='avatar-image-1' src=".$body." width='30px'/>
            <img class='avatar-image-2' src=".$eyes." width='30px'/>
            <img class='avatar-image-3' src=".$mouth." width='30px'/>
          </div></a>";
        } else {
          echo '<a class="nav-item nav-link" href="/registration.php" name="register">Register</a>';
        }
        ?>
      </div>
    </div>
  </div>
</nav>