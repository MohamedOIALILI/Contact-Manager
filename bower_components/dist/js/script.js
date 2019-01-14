var config = {
    apiKey: "your api key!",
    authDomain: "your authDomain!",
    databaseURL: "your database URL!",
    projectId: "your project Id!",
    storageBucket: "your storage Bucket!",
    messagingSenderId: "your messaging Sender Id!"
};
firebase.initializeApp(config);
$( document ).ready(function() {
    var initialDataLoaded = false;
    var dbRef = firebase.database().ref();

    dbRef.on('value', function(snap){
        if (!initialDataLoaded) {
            var items = [];
            var modals = [];
            $.each( snap.val(), function( key, val ) {

                items.push( "<tr>"
                    + "<td><input type='text' class='form-control' value='" + val["nom"] + "' readonly></td>"
                    + "<td><input type='text' class='form-control' value='" + val["prenom"] + "' readonly></td>"
                    + "<td><input type='email' class='form-control' value='" + val["email"] + "' readonly></td>"
                    + "<td><input type='tel' class='form-control' value='" + val["tel"] + "' readonly></td>"
                    + "<td><img class='img-circle' style='display: block;margin-left: auto;margin-right: auto;' width='104' height='136' src=' " + val["photo"] + "'></td>"
                    + "<td><a name='load_data_to_modify' id='"+key+"' href='#' class='btn btn-warning' role='button' data-toggle='modal' data-target='#modifyModal'><span class='glyphicon glyphicon-pencil'></a></td>"
                    + "<td><a name='load_to_delete' id='"+key+"' href='#' class='btn btn-danger popconfirm' role='button'><span class='glyphicon glyphicon-trash'></a></td>"
                    + "/<tr>");
            });
            $( "#table tbody" ).prepend(items);
        }
        else {
            location.reload();
        }

        $('.popconfirm').each(function(i, obj) {
            $(this).popConfirm({vall:$(this)[0].id});
        });

        $("a[name='load_data_to_modify']").click(function(){
            myId = $(this).attr('id');
            console.log(myId);
            $nom_to_modify = snap.child(myId).val().nom;
            $prenom_to_modify = snap.child(myId).val().prenom;
            $email_to_modify = snap.child(myId).val().email;
            $tel_to_modify = snap.child(myId).val().tel;
            $photo_to_modify = snap.child(myId).val().photo;

            $("#modal_nom").val($nom_to_modify);
            $("#modal_prenom").val($prenom_to_modify);
            $("#modal_email").val($email_to_modify);
            $("#modal_tel").val($tel_to_modify);
            $("#modal_photo").attr("src", $photo_to_modify);
        });
    });

    dbRef.once('value', function(snap) {
        initialDataLoaded = true;
    });

    var $imageupload = $('.imageupload');
    $imageupload.imageupload();

    $(document).on("click", ".dlt", function() {
        var key = $(this)[0].id;
        dbRef.child(key).remove();
    });

    $('.keyup-min-4').keyup(function() {
        $('span.error-keyup-1').remove();
        var inputVal = $(this).val();
        var characterRe = /^([a-zA-Z0-9]{4,})?$/;
        if(!characterRe.test(inputVal)) {
            $(this).after('<span class="error error-keyup-1 label label-primary">Minimum 4 caractères.</span>');
        }
    });

    $('.keyup-max-10').keyup(function() {
        $('span.error-keyup-2').remove();
        var inputVal = $(this).val();
        var characterReg = /^([a-zA-Z0-9]{0,10})?$/;
        if(!characterReg.test(inputVal)) {
            $(this).after('<span class="error error-keyup-2 label label-primary">Maximum 10 caractères.</span>');
        }
    });

    $('.keyup-email').keyup(function() {
        $('span.error-keyup-3').remove();
        var inputVal = $(this).val();
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        if(!emailReg.test(inputVal)) {
            $(this).after('<span class="error error-keyup-3 label label-primary">Format email invalide.</span>');
        }
    });

    $('.keyup-phone').keyup(function() {
        $('span.error-keyup-4').remove();
        var inputVal = $(this).val();
        var characterReg = /^((\+212( \d\d\d){3})|(0[1-9]( \d\d){4}))$/;
        if(!characterReg.test(inputVal)) {
            $(this).after('<span class="error error-keyup-4 label label-primary">Format +212 xxx xxx xxx <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ou 0x xx xx xx xx</span>');
        }
    });

    $("button[name='add']").click(function(){
        var nom = $("input[name='nom']");
        var prenom = $("input[name='prenom']");
        var email = $("input[name='email']");
        var tel = $("input[name='tel']");
        var photo = $("input[name='photo']");

        if(nom.val().length == 0 || prenom.val().length == 0 || email.val().length == 0 || tel.val().length == 0)
        {
            var msg = "Veuillez remplir tous les champs !!!";
            $("#addModal #message").text(msg);
            $('#addModal').modal('show');
        }
        else
        {
            if($('span.error').length > 0){
                var msg = "Veuillez respecter les règles sur les champs !!!";
                $("#addModal #message").text(msg);
                $('#addModal').modal('show');
                return false;
            } else {
                if(photo.get(0).files.length === 0)
                {
                    var m = "Veuillez choisir une photo !!!";
                    $("#addModal #message").text(m);
                    $('#addModal').modal('show');
                }
                else
                {
                    var msg = "Veuillez patienter pendant le chargement de votre photo et vos données";
                    $("#addModal #message").text(msg);
                    $('#addModal').modal('show');
                    var filename = uploadedPhoto.name;
                    var storageRef = firebase.storage().ref('/photos/' + filename);
                    var uploadTask = storageRef.put(uploadedPhoto);

                    uploadTask.on('state_changed', function(snapshot){

                    }, function(error){
                        alert(error);
                    }, function(){
                        var downloadURL = uploadTask.snapshot.downloadURL;
                        photo = downloadURL;
                        console.log(downloadURL);
                        var pushed = dbRef.push({
                            nom : nom.val(),
                            prenom : prenom.val(),
                            email : email.val(),
                            tel : tel.val(),
                            photo : photo
                        });
                    });
                }
            }
        }
    });

    $("button[name='modify']").click(function(){
        var nv_nom = $("#modal_nom");
        var nv_prenom = $("#modal_prenom");
        var nv_email = $("#modal_email");
        var nv_tel = $("#modal_tel");
        var nv_photo = $("input[name='nv_photo']");

        if(nv_nom.val().length == 0 || nv_prenom.val().length == 0 || nv_email.val().length == 0 || nv_tel.val().length == 0)
        {
            var msg = "Veuillez remplir tous les champs !!!";
            $("#addModal #message").text(msg);
            $('#addModal').modal('show');
        }
        else
        {
            if($('span.error').length > 0){
                var msg = "Veuillez respecter les règles sur les champs !!!";
                $("#addModal #message").text(msg);
                $('#addModal').modal('show');
                return false;
            } else {
                if($("#modal_photo").is(":visible"))
                {
                    dbRef.child(myId).update({
                        nom : nv_nom.val(),
                        prenom : nv_prenom.val(),
                        email : nv_email.val(),
                        tel : nv_tel.val()
                    });
                }
                else
                {
                    var msg = "Veuillez patienter pendant le chargement de votre photo et vos données";
                    $("#addModal #message").text(msg);
                    $('#addModal').modal('show');
                    var filename = nv_uploadedPhoto.name;
                    var storageRef = firebase.storage().ref('/photos/' + filename);
                    var uploadTask = storageRef.put(nv_uploadedPhoto);

                    uploadTask.on('state_changed', function(snapshot){

                    }, function(error){
                        alert(error);
                    }, function(){
                        var downloadURL = uploadTask.snapshot.downloadURL;
                        photo = downloadURL;
                        console.log(downloadURL);

                        dbRef.child(myId).update({
                            nom : nv_nom.val(),
                            prenom : nv_prenom.val(),
                            email : nv_email.val(),
                            tel : nv_tel.val(),
                            photo : photo
                        });
                    });
                }
            }
        }
    });

    $("#photo").change(function(){
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(this.files[0]);
            console.log(this.files[0]);
            uploadedPhoto = this.files[0];
        }
    });

    $("#nv_photo").change(function(){
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(this.files[0]);
            console.log(this.files[0]);
            nv_uploadedPhoto = this.files[0];
            $("#modal_photo").hide();
        }
    });

    $("#modal_supp").click(function () {
        $("#modal_photo").show();
    });


});
