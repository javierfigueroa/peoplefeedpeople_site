var products; //hold json from products
var donation; //holds the total donation value for a campaign
var shipping = 40; //shipping for 6 items
var userId = "USR78057B42890C11E2BC85BDD7562F032E";
var crowdtilt = new Crowdtilt.getInstance(); //Handle crowdtilt

$(function() {
    //Load templates
    $.Mustache.load('./tpl/templates.tpl.htm').done(function () {
        main();
    });
});


function main() {
    setupSlider();
    setGridContent();
    setCampaignContent(1);
    //set donation form fixed
    $('#donation-form').scrollToFixed({ marginTop: 50});
 }
 
 function setupSlider() {
    $( "#slider" ).slider({
      value:1,
      min: 1,
      max: 6,
      step: 1,
      orientation: "horizontal",
      range: "min",
      slide: sliderMoved
    });
 }
 
 function sliderMoved( event, ui ) {
    var value = ui.value;
    $("#peoples").empty();
    switch (value) {
        case 2:
        setPeopleImage("#FF6C00", "3", "img/people-3.png", 1);
        break;
        case 3:
        setPeopleImage("#FF7F00", "4", "img/people-4.png", 1);
        break;
        case 4:
        setPeopleImage("#FFB100", "6", "img/people-3.png", 2);
        break;
        case 5:
        setPeopleImage("#FFCB00", "8", "img/people-4.png", 2);
        break;
        case 6:
        setPeopleImage("#9FEE00", "14", "img/people-7.png", 2);
        break;
        default:
        setPeopleImage("#FF0700", "2", "img/people-2.png", 1);
        break;
    }
    
    $(".times").text("x" + value);
    updateCampaignTilt(donation, value);
    setCampaignContent(value);
}

function setPeopleImage(color, people, image, times) {
    var sliderRange = $("#slider .ui-slider-range");
    sliderRange.css("background", color);
    for (var i=0; i<times; i++) {
        $('#peoples').mustache('people', {image: image});
    }
}
 
function setGridContent() {
    $("#grid").empty();
    $.getJSON("json/products.json", function(response) {
        var items = products = response.products,
            itemsLength = items.length,
            people = parseInt($('#slider').slider("option", "value")),
            sum = 0,
            i = 0;
            
        for ( ; i<itemsLength; i++) {
            var item = items[i];
            $('#grid').mustache('grid-item', {
                url: item.url,
                name: item.name,
                image: item.image,
                times: "x"+people
            });
            
            donation = sum += item.price;
        }
        
        updateCampaignTilt(sum, people);
    });
}

function updateCampaignTilt(total, people) {    
    // $("#total-donation").text("$" + Math.ceil(total * people + shipping));
}

function setCampaignContent(selection) {
    crowdtilt.getCampaign(selection, function(campaign) {
        var total = campaign.tilt_amount,
            raised = campaign.stats.raised_amount / 100,
            remainder = total - raised;
            
        $("#total-donation").text("$" + total);
        $("#raised-donation").text("$" + raised);
        $("#remainder-donation").text("$" + remainder)
    });
}
 