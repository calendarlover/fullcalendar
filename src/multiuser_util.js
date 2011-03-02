/**
* @constructor
* UserManager
*/    
var UserManager = function(options){
	this.options = $.extend(
		{},
		defaults.multiUser,
		options.multiUser
	);
	this.users = options.multiUser.users;
	delete this.options.users;
	
	this.multiUser = this.users.length>0;
	
	var user;
	for (var i=0; i<this.users.length; i++) {
		user = this.users[i];
		
		if(this.options.forceVisible || user.visible === undefined) {
			user.visible = this.options.visible;
		}
	}
	
	//Fiters
	this.createFilters = function(elt) {
		var self = this;
		var s;
		$.each(this.getUsers(), function(){
			s += '<input class="fc-filter" type="checkbox" name="fc-filter" value="' + this.id + '" ' + (this.visible ? 'checked="checked"' : '') + ' />' + this.name + '<br />';
		
		});
		$(elt).append($(s));
		
		$('.fc-filter').click(function(){
			self.filter(this);
		});
	};
	
	this.filter = function(elt) {
		this.toggle(elt.value);
		$('#calendar').data('fullCalendar').hideAndRender();
	};
	
	//methods
	this.getUsers = function() { return this.users; };
	this.getVisibleUsers = function(visible) {
		visible = (visible === undefined) ? true : visible;
		var tmpUsers = [];
		for (var i=0; i<this.users.length; i++) {
			if (this.users[i].visible === visible) {
				tmpUsers.push(this.users[i]);
			}
		}
		return tmpUsers;
	};
	this.getUser = function(userId) {
		var index = this.getUserPos(userId, false);
		if (index !== false) {
			return this.users[index];
		} else {
			return false;
		}
	};
	this.getUserName = function(index) { return this.users[index].name; };
	this.getUserId = function(index, visible) {
		visible = (visible === undefined) ? true : visible;
		if (this.multiUser) {
			if (visible) {
				var users = this.getVisibleUsers();
			} else {
				var users = this.users;
			}
			return users[index].id;
		} else {
			return 1;
		}
	};
	this.getUserPos = function(userId, visible) {
		visible = (visible === undefined) ? true : visible;
		if (this.multiUser) {
			if (visible) {
				var users = this.getVisibleUsers();
			} else {
				var users = this.users;
			}
			for (var i = 0; i < users.length; i++) {
				if (users[i].id == userId) {
					return i;
				}
			}
			return -1;
		}
		return 0;
	};
	
	this.hide = function(userId) { this.getUser(userId).visible = false; };
	this.show = function(userId) { this.getUser(userId).visible = true; };
	this.toggle = function(userId) { this.getUser(userId).visible = !this.getUser(userId).visible; };
	this.isVisible = function (userId) { return this.getUser(userId).visible; };
	this.isVisibleIndex = function(index) { return this.users[index].visible; };
	this.nbUsers = function(visible) {
		visible = (visible === undefined) ? true : visible;
		if (visible) {
			return this.getVisibleUsers().length;
		} else {
			return this.users.length;
		}
	};
	
	this.createFilters(this.options.filterId);
};