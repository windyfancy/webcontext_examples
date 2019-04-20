$(function (){
    $("#btn1").click(function (){
        $.post("/test","a=1&b=2",function (res){
            $("#message").html(res);
        });
    })



    $("#btn2").click(function (){
        $.post("/test",{a:1,b:2,c:3},function (res){
            $("#message").html(res);
        });
    })
})