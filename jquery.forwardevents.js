(function($){

    if(!$) return;

    function triggerEvent($elem, eventType, event, relatedTarget){
        let originalType = event.type,
            originalEvent = event.originalEvent,
            originalTarget = event.target,
            originalRelatedTarget = event.relatedTarget;
        event.target = $elem[0];
        event.type = eventType;
        event.originalEvent = null;
        if(relatedTarget){
            event.relatedTarget = relatedTarget
        }
        $elem.trigger(event);
        event.type = originalType;
        event.originalEvent = originalEvent;
        event.target = originalTarget;
        event.relatedTarget = originalRelatedTarget;
    };

    $.fn.forwardevents = function(settings){
        let options = $.extend({
                enableMousemove: false,
                dblClickThreshold: 500,
                directEventsTo: null
            }, settings);
        //let instance = this;
        return this.each(function(){
            let lastT, clickX, clickY,
                $this = $(this),                
                clicks = 0,
                lastClick = 0;
            $this.on("mouseout", function(e){
                if(lastT){
                    triggerEvent(lastT, "mouseout", e, $this[0])
                    //lastT = null;
                }
            }).on("mousemove mousedown mouseup mousewheel", function(e){
                if ($this.is(":visible")){
                    let t,
                        event = e.originalEvent,
                        eventType = event.type,
                        mouseX = event.clientX,
                        mouseY = event.clientY;
                    e.stopPropagation()
                    if(options.directEventsTo != null){
                        t = options.directEventsTo;
                    } else {
                        $this.hide();
                        t = $(document.elementFromPoint(mouseX, mouseY));
                        $this.show();
                    }
                    if(!t){
                        triggerEvent(lastT, "mouseout", e);
                        lastT = t;						
                        return;
                    }
                    if(options.enableMousemove || eventType !== "mousemove"){
                        triggerEvent(t, eventType, e);
                    }
                    if(lastT && t[0] === lastT[0]){
                        if(eventType == "mouseup"){
                            // using document.elementFromPoint in mouseup doesn't trigger dblclick event on the overlay
                            // hence we have to manually check for dblclick
                            if(clickX != mouseX || clickY != mouseY || e.timeStamp - lastClick > options.dblClickThreshold){
                                clicks = 0;
                            }
                            clickX = mouseX;
                            clickY = mouseY;
                            lastClick = e.timeStamp;
                            triggerEvent(t, "click", e)
                            if(++clicks == 2){
                                triggerEvent(t, "dblclick", e)
                                clicks = 0
                            }
                        }
                    } else {
                        clicks = 0;
                        if(lastT){
                            triggerEvent(lastT, "mouseout", e, t[0])
                        }
                        triggerEvent(t, "mouseover", e, lastT ? lastT[0] : $this[0])
                    }
                    lastT = t;
                    //instance._suspended = false;
                }
            })
        })
    }
})(window.jQuery)