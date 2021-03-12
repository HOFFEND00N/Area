<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
    <title>Add news</title>
</head>

<body>
    <div class="container">
        <div class="page-header">
            <h1>Add News</h1>
        </div>

        <?php

        if ($_POST) {
            $path = "config\database.php";
            include($path);
            try {
                $query = "INSERT INTO news SET name=:name, description=:description, image=:image, created=:created";
                $statement = $con->prepare($query);

                $name = htmlspecialchars(strip_tags($_POST['name']));
                $description = htmlspecialchars(strip_tags($_POST['description']));

                $target_dir = "uploads/images/";
                $fileName = basename($_FILES["image"]["name"]);
                $targetFilePath = $target_dir . $fileName;

                $statement->bindParam(':name', $name);
                $statement->bindParam(':description', $description);
                $statement->bindParam(':image', $fileName);
                $created = date('Y-m-d H:i:s');
                $statement->bindParam(':created', $created);

                if (!move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
                    echo "Sorry, there was an error uploading your file.";
                }

                if ($statement->execute()) {
                    echo "<div class='alert alert-success'>Record was saved.</div>";
                } else {
                    echo "<div class='alert alert-danger'>Unable to save record.</div>";
                }
            } catch (PDOException $exception) {
                die('ERROR: ' . $exception->getMessage());
            }
        }
        ?>

        <form method="POST" action="" enctype="multipart/form-data">
            <table class='table table-hover table-responsive table-bordered'>
                <tr>
                    <td> <label for="name"> Name </label> </td>
                    <td> <input type="text" name="name" id="name" class="form-control"> </td>
                </tr>
                <tr>
                    <td><label for="description"> Description </label></td>
                    <td><input type="text" name="description" id="description" class="form-control"></td>
                </tr>
                <tr>
                    <td><label for="image"> Image </label></td>
                    <td><input type="file" name="image" id="image" accept="image/*" class="form-control"></td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <input type="submit" value="Post news" class='btn btn-primary'>
                        <a href='index.php' class='btn btn-danger'>Main page</a>
                    </td>
                </tr>
            </table>
        </form>
    </div>
</body>

</html>