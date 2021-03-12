<!DOCTYPE HTML>
<html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
    <title>Edit</title>
</head>

<body>
    <div class="container">

        <div class="page-header">
            <h1>Edit news</h1>
        </div>

        <?php
        $id = isset($_GET['id']) ? $_GET['id'] : die('ERROR: Record ID not found.');

        $path = "config\database.php";
        include($path);

        try {
            $query = "SELECT id, name, description, image FROM news WHERE id = ? LIMIT 0,1";
            $stmt = $con->prepare($query);

            $stmt->bindParam(1, $id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $imageName = $row['image'];
            $imageURL = 'uploads/images/' . $imageName;
            $name = $row['name'];
            $description = $row['description'];
            $image = "<td><img src=\"" . $imageURL . "\"/></td>";
        } catch (PDOException $exception) {
            die('ERROR: ' . $exception->getMessage());
        }

        if ($_POST) {
            try {
                $query = "UPDATE news 
                    SET name=:name, description=:description, image=:image 
                    WHERE id = :id";

                $stmt = $con->prepare($query);

                $name = htmlspecialchars(strip_tags($_POST['name']));
                $description = htmlspecialchars(strip_tags($_POST['description']));

                $target_dir = "uploads/images/";
                $fileName = basename($_FILES["image"]["name"]);

                if ($_FILES["image"]["size"] == 0)
                    $fileName = $imageName;

                $targetFilePath = $target_dir . $fileName;

                $stmt->bindParam(':name', $name);
                $stmt->bindParam(':description', $description);
                $stmt->bindParam(':image', $fileName);
                $stmt->bindParam(':id', $id);

                echo "<br>";
                if ($stmt->execute()) {
                    move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath);
                    echo "<div class='alert alert-success'>Record was updated.</div>";
                } else {
                    echo "<div class='alert alert-danger'>Unable to update record. Please try again.</div>";
                }
            } catch (PDOException $exception) {
                die('ERROR: ' . $exception->getMessage());
            }
        }
        ?>

        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"] . "?id={$id}"); ?>" method="post" enctype="multipart/form-data">
            <table class='table table-hover table-responsive table-bordered'>
                <tr>
                    <td><label for="name"> Name </label></td>
                    <td><input type='text' name='name' value="<?php echo htmlspecialchars($name, ENT_QUOTES);  ?>" class='form-control' /></td>
                </tr>
                <tr>
                    <td><label for="description"> Description </label></td>
                    <td><input type="text" name='description' class='form-control' value="<?php echo htmlspecialchars($description, ENT_QUOTES);  ?>"></td>
                </tr>
                <tr>
                    <td><label for="Chosen image"> Chosen Image </label></td>
                    <?php echo $image; ?>
                </tr>
                <tr>
                    <td><label for="image"> Choose new image </label></td>
                    <td><input type="file" name="image" id="image" accept="image/*" value="<?php echo htmlspecialchars("", ENT_QUOTES);  ?>" class="form-control"></td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <input type='submit' value='Save Changes' class='btn btn-primary' />
                        <a href='#' onclick='delete_user(<?php echo $id ?>);' class='btn btn-danger'>Delete news</a>
                        <a href='index.php' class='btn btn-primary'>Back to main page</a>
                    </td>
                </tr>
            </table>
        </form>

    </div>

    <script type='text/javascript'>
        function delete_user(id) {
            console.log("here i am")
            var answer = confirm('Are you sure?');
            if (answer) {
                window.location = 'delete.php?id=' + id;
            }
        }
    </script>
</body>

</html>