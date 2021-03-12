<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
    <title>News</title>
</head>

<body>
    <div class="container">
        <div class="page-header">
            <h1>News</h1>
        </div>
        <form method="POST" action="" enctype="multipart/form-data">
            <input type="hidden" name="sortOption" value="DESC">
            <input type='submit' value='Sort descending' class='btn btn-primary'>
        </form>
        <form method="POST" action="" enctype="multipart/form-data">
            <input type="hidden" name="sortOption" value="ASC">
            <input type='submit' value='Sort descending' class='btn btn-primary'>
        </form>
        <?php
        include($_SERVER['DOCUMENT_ROOT'] . "/config/database.php");

        $action = isset($_GET['action']) ? $_GET['action'] : "";

        if ($action == 'deleted') {
            echo "<div class='alert alert-success'>Record was deleted.</div>";
        }

        $query = "SELECT id, name, description, image FROM news";
        $sortOption = isset($_POST['sortOption']) ? htmlspecialchars(strip_tags($_POST['sortOption'])) : "DESC";

        if ($sortOption == 'ASC') {
            $query .= " ORDER BY modified ASC";
        } else {
            $query .= " ORDER BY modified DESC";
        }

        $statement = $con->prepare($query);
        $statement->execute();

        $num = $statement->rowCount();

        echo "<a href='add.php' class='btn btn-primary m-b-1em'>Add news</a>";

        if ($num > 0) {
            echo "<table class='table table-hover table-responsive table-bordered'>";
            echo "<tr>";
            echo "<th>ID</th>";
            echo "<th>Name</th>";
            echo "<th>Description</th>";
            echo "<th>Image</th>";
            echo "<th>Action</th>";
            echo "</tr>";

            while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
                extract($row);

                $imageURL = 'uploads/images/' . $image;

                echo "<tr>";
                echo "<td>{$id}</td>";
                echo "<td>{$name}</td>";
                echo "<td>{$description}</td>";
                echo "<td><img src=\"";
                echo $imageURL;
                echo "\"/></td>";
                echo "<td>";
                echo "<a href='edit.php?id={$id}' class='btn btn-primary m-r-1em'>Edit</a>";

                echo "</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<div class='alert alert-danger'>No records found.</div>";
        }
        ?>
    </div>
</body>