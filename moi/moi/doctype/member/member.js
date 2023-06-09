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

// frappe.ui.form.on('Member', {
// 	after_save: function (frm) {
//         send_sms(frm);
//     }
// });

// //Send SMS
// var send_sms = function (frm) {
//     var message = "Thank you for Registering " + frm.doc.full_name +" Welcome to" + frm.doc.assembly +" !";
// 	console.log(message);
// 		frappe.call({
// 		method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
// 		args: {
// 			receiver_list: [frm.doc.mobile_no],
// 			msg: message,
// 		},
// 		callback: function(r) {
// 			if(r.exc) {
// 			msgprint(r.exc);
// 				return;
// 			}
// 		}
// 	});
// }

frappe.ui.form.on('Member', {
    age_group: function(frm) {
        // Get the selected age_group from the Member DocType
        var ageGroup = frm.doc.age_group;

        // Make an AJAX request to fetch the team_name based on the age_group
        frappe.call({
            method: 'moi.moi.doctype.member.member.assign_group',
            args: {
                age_group: ageGroup
            },
            callback: function(response) {
                // Handle the response
                if (response && response.message) {
                    // Update the moi_small_group field in the Member DocType
                    frm.set_value('moi_small_group', response.message.team_name);
                }
            }
        });
    }
});


frappe.ui.form.on('Member', {
    validate: function(frm) {
        // Get the email field value
        var email = frm.doc.email;

        // Get the Moi Small Group field value (assuming it's a Link field)
        var moiSmallGroup = frm.doc.moi_small_group;

        // Fetch data from the Moi Small Group document
        frappe.call({
            method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
            args: {
                moi_small_group: moiSmallGroup
            },
            callback: function(response) {
                var data = response.message;

                // Extract the required fields from the Moi Small Group document
                var teamName = data.team_name;
                var leaderName = data.team_leader;
                var leaderPhone = data.leader_phone_number;
                var leaderEmail = data.leader_email;
                var whatsApp = data.small_group_whatsapp_link;

                // Send an email to the specified email address
                var subject = frappe.get_doc("Email Template", 'Registration Acknowledgment').subject;
                var context = {
					'full_name': frappe.form_dict.get('full_name'),
					'moi_small_group': teamName,
					'team_leader': leaderName,
					'leader_phone_number': leaderPhone,
					'leader_email': leaderEmail,
					'small_group_whatsapp_link': whatsApp
				};
				var message = frappe.render_template(frappe.get_doc("Email Template", 'Registration Acknowledgment').response, context, is_path = False);
			
				frappe.call({
                    method: 'moi.moi.doctype.member.member.send_email',
                    args: {
                        recipients: email,
                        subject: subject,
                        content: message
                    },
                    callback: function(response) {
                        // Handle the response if needed
                        // For example, show a success message
                        frappe.msgprint('Email sent successfully!');
                    }
                });
            }
        });
    }
});
