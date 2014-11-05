var autoAccepting,
    timer;

chrome.storage.local.get("queue", function(data){
	data = data.queue;

	if (!data)
		return;

	var code = /Protection code: ([0-9A-Z]{4})/.exec(document.querySelector(".quote").textContent)[1],
	    acceptTime = Math.min(data.time, Date.now()+30000),
	    urlRegex = /https?:\/\/(.*)/;
	
	if (!code || code !== data.protectionCode)
		return;
	if (!document.URL || urlRegex.exec(document.URL)[1] !== urlRegex.exec(data.offer)[1])
		return;
	if (!data.time || acceptTime-Date.now() < 10000) // won't accept offers with <10 sec left
		return;

	console.log("Enabling");
	autoAccepting = true;

	// create UI
	var container = document.createElement("div");
    container.className = "destroyer info";
    container.innerHTML = '<p>LoungeDestroyer would like to accept this offer.</p><button class="red">Don\'t accept</button><p>Accepting in <b class="time-left"></b> seconds.</p>';

    container.querySelector("button").addEventListener("click", function(){
        clearTimeout(timer);
        container.className = "destroyer info hidden";
    });

    timer = setTimeout(acceptOffer, acceptTime-Date.now());

    // update timer
    (function timerLoop(){
    	if (!autoAccepting)
    		return;

        var span = container.querySelector(".destroyer.info .time-left");
        span.textContent = ((acceptTime - Date.now())/1000).toFixed(2) + "s";

        requestAnimationFrame(timerLoop);
    })();

    document.body.appendChild(container);
});

function acceptOffer(){
	document.querySelector(".destroyer.info").className = "destroyer info hidden";

	// if trade is suspicious, accept it anyway
	var obs = new MutationObserver(function(records){
		for (var i = 0; i < records.length; ++i) {
			var record = records[i];
			if (!record.type === "childList" || !record.addedNodes)
				continue;

			// loop through every added node
			for (var j = 0, k = record.addedNodes.length; j < k; ++j) {
				var elm = record.addedNodes[j];
				if (elm.className !== "newmodal")
					return;

				elm.querySelector(".btn_green_white_innerfade").click();
				document.getElementById("trade_confirmbtn").click()
			}
		}
		clearTimeout(timer);
	});
	obs.observe(document.body, {childList: true});

	document.getElementById("you_notready").click();
	// if trade isn't suspicious, accept it
	timer = setTimeout(function(){document.getElementById("trade_confirmbtn").click()}, 1000);
}