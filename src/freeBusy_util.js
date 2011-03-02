

/**
* @constructor
* freebusy manager
*/
var FreeBusyManager = function(options){
	this.userManager = options.userManager;
	delete options.userManager;
	
    this.options = $.extend(
    	{},
    	defaults.freeBusy,
    	options
    );
    delete this.options.freeBusy;
    
	this.multiUser = this.userManager.nbUsers() > 0;
	this.active = false;	
	this.freeBusys = [];
	
	/**
	* @constructor
	* freebusy
	*/    
	var FreeBusy = function(options){
		this.options = $.extend({}, options || {});
		
		this.getStart = function() { return this.options.start; };
		this.getEnd = function() { return this.options.end; };
		this.getFree = function() { return this.options.free; };
		this.getUser = function() { return this.options.user; };
		this.getOptions = function() { return this.options; };
		
		//setters
		this.setStart = function(startVal) { this.options.start = startVal; return this; };
		this.setEnd = function(endVal) { this.options.end = endVal; return this; };
		this.setFree = function(freeVal) { this.options.free = freeVal; return this; };
		this.contains = function(dateTime) {
			return Math.floor(dateTime.getTime() / 1000) >= Math.floor(this.getStart().getTime() / 1000) && Math.floor(dateTime.getTime() / 1000) < Math.floor(this.getEnd().getTime() / 1000);
		};
	};
	
	this.init = function() {
		var self = this;
		if(this.multiUser) {
			$.each(this.userManager.getUsers(false), function(){
				self.freeBusys.push(new FreeBusy({
					start: self.options.start,
					end: self.options.end,
					free: self.options.free,
					user: this.id
				}));
			});
		} else {
			this.freeBusys.push(new FreeBusy({
				start: this.options.start,
				end: this.options.end,
				free: this.options.free
			}));
		}
	};
	
	this.load = function(freeBusys) {
		var self = this;
		this.active = freeBusys.length > 0;
		$.each(freeBusys, function(index, freeBusy){
			self.insertFreeBusy(new FreeBusy(freeBusy));
		});
	};
	
	this.free = function() {
		delete this.freeBusys;
		this.freeBusys = [];
		this.active = false;
	};
	
	this.reload = function(freeBusys) {
		this.free();
		this.init();
		this.load(freeBusys);
	};
	
	this.getFreeBusys = function(start, end, user) {
		var freeBusy = [];
		var self = this;
		if(end.getTime() < start.getTime()){
			return freeBusy;
		}
		//we create a new freeBusy in order to use 'contains' method
		var tmpFreeBusy = new FreeBusy({start: start, end: end});
		$.each(this.freeBusys, function() {
			if((self.multiUser && this.getUser() !== user) || this.getStart().getTime() >= end.getTime() || this.getEnd().getTime() <= start.getTime()){
				return true;
			}

			if(tmpFreeBusy.contains(this.getStart()) && tmpFreeBusy.contains(this.getEnd())) {
				freeBusy.push(this);
			} else if (tmpFreeBusy.contains(this.getStart())) {
				freeBusy.push(new FreeBusy($.extend({},
					this.getOptions(),
					{end: end}
				)));
			} else if (tmpFreeBusy.contains(this.getEnd())) {
				freeBusy.push(new FreeBusy($.extend({},
					this.getOptions(),
					{start: start}
				)));
			} else {
				freeBusy.push(new FreeBusy($.extend({},
					this.getOptions(),
					{start: start, end: end}
				)));
			}
		});
		return freeBusy;
	};
	this.insertFreeBusy = function(freeBusy) {
		var freeBusys = this.freeBusys,
			multiUser = this.multiUser,
			start = freeBusy.getStart(),
			end = freeBusy.getEnd(),
			free = freeBusy.getFree(),
			user = freeBusy.getUser(),
			newFreeBusys = [];
		
		var add = false;
		$.each(freeBusys, function(){
			if((multiUser && this.getUser() !== user) || this.getStart().getTime() >= end.getTime() || this.getEnd() <= start.getTime()){
				return true;
			}
			//overlapping
			if(this.contains(start) && this.contains(end)) {
				if (this.getFree() !== free) {
					freeBusys.push(new FreeBusy($.extend({},
						this.getOptions(),
						{start: end}
					)));
					this.setEnd(start);
					add = true;
				}
			} else if (this.contains(start)) {
				if (this.getFree() !== free) {
					this.setEnd(start);
				} else {
					this.setEnd(end);
					add = true;
				}
			} else if (this.contains(end)) {
				if (this.getFree() !== free) {
					this.setStart(end);
				} else {
					this.setStart(start);
					add = true;
				}
			} else {
				if (this.getFree() !== free) {
//					this.remove(); //auto-remove ???
//					add = true;
				}
			}
		});
		if (add && freeBusy.getStart() < freeBusy.getEnd() && freeBusy.getFree() === this.options.free) {
			freeBusys.push(freeBusy);
		}
	};
	
	this.init();
};