<?php
include("./cookieManagement.php");

session_start();
if (!isset($_SESSION["registered"])) {
  saveDataInSession();
}
?>

<html lang="zxx">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title> ECM1417 </title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
  <link rel="stylesheet" type="text/css" href="./Style.css">
</head>

<body>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN"
    crossorigin="anonymous"></script>

  <?php include "./navMenu.php"; ?>

  <?php
  // Load the data from the file and decode it
  $json_string = file_get_contents('./gameData.json');
  $player_data = json_decode($json_string)->data;
  
  // Calculate the total score for each player
  foreach ($player_data as $player) {
    $player->totalScore = array_sum($player->levelScores);
  }

  // Sort the player data by total score
  usort($player_data, function ($player1, $player2) {
    if ($player1->totalScore == $player2->totalScore) {
      return 0;
    }
    return ($player1->totalScore > $player2->totalScore) ? -1 : 1;
  });

  // Only display the top 100 players
  $player_data = array_slice($player_data, 0, 100);

  function getEmojiPath($IndexList)
  {
    $bodyPath = "./emojiAssets/body/";
    $eyesPath = "./emojiAssets/eyes/";
    $mouthPath = "./emojiAssets/mouth/";

    switch ($IndexList[0]) {
      case 1:
        $bodyPath .= "green.png";
        break;
      case 2:
        $bodyPath .= "red.png";
        break;
      case 3:
        $bodyPath .= "yellow.png";
        break;
    }

    switch ($IndexList[1]) {
      case 1:
        $eyesPath .= "closed.png";
        break;
      case 2:
        $eyesPath .= "laughing.png";
        break;
      case 3:
        $eyesPath .= "long.png";
        break;
      case 4:
        $eyesPath .= "normal.png";
        break;
      case 5:
        $eyesPath .= "rolling.png";
        break;
      case 6:
        $eyesPath .= "winking.png";
        break;
    }

    switch ($IndexList[2]) {
      case 1:
        $mouthPath .= "open.png";
        break;
      case 2:
        $mouthPath .= "sad.png";
        break;
      case 3:
        $mouthPath .= "smiling.png";
        break;
      case 4:
        $mouthPath .= "straight.png";
        break;
      case 5:
        $mouthPath .= "surprise.png";
        break;
      case 6:
        $mouthPath .= "teeth.png";
        break;
    }

    return [$bodyPath, $eyesPath, $mouthPath];
  }

  ?>

  <div id="main">
    <div class="leaderboard">
      <h3>Leaderboard</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th colspan="2">Level 1</th>
            <th colspan="2">Level 2</th>
            <th colspan="2">Level 3</th>
            <th colspan="2">Level 4</th>
            <th colspan="2">Level 5</th>
            <th colspan="2">Level 6</th>
            <th colspan="2">Level 7</th>
            <th colspan="2">Level 8</th>
            <th colspan="2">Level 9</th>
          </tr>
          <tr>
            <th>Rank</th>
            <th colspan="2">Player Name</th>
            <th>Total</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rank = 1;
          foreach ($player_data as $player) {
            ?>
            <tr>
              <td>
                <?php echo $rank ?>
              </td>
              <td class="no-right-border">
                <?php
                $paths = getEmojiPath($player->icon);
                ?>

                <div class='avatar-container icon' margin='0px'>
                  <?php
                  echo "<img class='avatar-image-1' src='" . $paths[0] . "' width='30px'/>";
                  echo "<img class='avatar-image-2' src='" . $paths[1] . "' width='30px'/>";
                  echo "<img class='avatar-image-3' src='" . $paths[2] . "' width='30px'/>";
                  ?>
                </div>
              </td>
              <td class="no-left-border"><b>
                <?php echo $player->name; ?>
              </td></b>
              <td><b>
                  <?php echo $player->totalScore; ?>
                </b></td>
              <?php for ($i = 0; $i < 9; $i++) { ?>
                <td>
                  <?php echo isset($player->levelScores[$i]) ? $player->levelScores[$i] : ''; ?>
                </td>
                <td>
                  <?php echo isset($player->levelTimes[$i]) ? gmdate('i:s', $player->levelTimes[$i]) : ''; ?>
                </td>
              <?php } ?>
            </tr>
            <?php
            $rank++;
          }
          ?>
        </tbody>
      </table>
    </div>
  </div>
</body>

</html>