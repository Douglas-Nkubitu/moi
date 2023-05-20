// Copyright (c) 2023, Douglas Nkubitu and contributors
// For license information, please see license.txt

frappe.ui.form.on('Member', {
	refresh: function(frm) {
		frm.set_query("department", () => {
			return {
				filters: {
					is_group: 0,
				}
			}
		});

		frm.set_query("member_group", () => {
			return {
				filters: {
					is_group: 0,
				}
			}
		});
	}
});

frappe.ui.form.on('Member', {
    after_insert: function (frm) {
        send_sms(frm);
    }
});

//Send SMS
var send_sms = function (frm) {
    var message = "Thank you for Registering " + frm.doc.full_name +" Welcome to" + frm.doc.assembly +" !";
	console.log(message);
		frappe.call({
		method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
		args: {
			receiver_list: [frm.doc.mobile_no],
			msg: message,
		},
		callback: function(r) {
			if(r.exc) {
			msgprint(r.exc);
				return;
			}
		}
	});
}