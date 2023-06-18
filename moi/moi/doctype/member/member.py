# Copyright (c) 2023, Douglas Nkubitu and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address, validate_phone_number

class Member(Document):
	def validate(self):
		self.set_full_name()
		self.validate_email()
		self.validate_mobile_no()
		
	def set_full_name(self):
		self.full_name = " ".join(filter(None, [self.first_name, self.last_name]))

	def validate_mobile_no(self):
		validate_phone_number(self.mobile_no.strip(), True)

	def validate_email(self):
		validate_email_address(self.email.strip(), True)
                

@frappe.whitelist(allow_guest=True)
def get_moi_small_group_data(moi_small_group):
    moi_small_group_data = frappe.get_doc("MoI Small Group", moi_small_group)
    return {
        'team_name': moi_small_group_data.team_name,
        'leader_name': moi_small_group_data.team_leader,
        'leader_phone_number': moi_small_group_data.leader_phone_number,
        'leader_email': moi_small_group_data.leader_email,
        'small_group_whatsapp_link': moi_small_group_data.small_group_whatsapp_link
    }

@frappe.whitelist(allow_guest=True)
def get_email_template(template_name, doc, leader_name=None, leader_phone_number=None, leader_email=None, small_group_whatsapp_link=None):
    """Returns the processed HTML of an email template with the given doc and additional fields"""
    if isinstance(doc, str):
        doc = json.loads(doc)

    email_template = frappe.get_doc("Email Template", template_name)
    if leader_name:
        doc["leader_name"] = leader_name
    if leader_phone_number:
        doc["leader_phone_number"] = leader_phone_number
    if leader_email:
        doc["leader_email"] = leader_email
    if small_group_whatsapp_link:
        doc["small_group_whatsapp_link"] = small_group_whatsapp_link

    return email_template.get_formatted_email(doc)


@frappe.whitelist(allow_guest=True)
def send_email(recipients, subject, content):
    frappe.sendmail(
        recipients=recipients,
        subject=subject,
        content=content
    )

@frappe.whitelist(allow_guest=True)
def allocate_small_group(age_group):
    # Retrieve all the MoI Small Group records linked to the age group
    moi_small_groups = frappe.get_all(
        'MoI Small Group',
        filters={'age_group': age_group},
        fields=['team_name']
    )

    # Get the count of existing member records linked to each MoI Small Group
    member_records = frappe.get_all(
        'Member',
        filters={'age_group': age_group},
        fields=['moi_small_group']
    )
    group_counts = {}
    for record in member_records:
        group = record.get("moi_small_group")
        if group in group_counts:
            group_counts[group] += 1
        else:
            group_counts[group] = 1

    # Sort the MoI Small Groups based on the count of existing member records
    sorted_groups = sorted(moi_small_groups, key=lambda group: group_counts.get(group["team_name"], 0))

    # Determine the next available MoI Small Group
    next_group = sorted_groups[0] if sorted_groups else None

    return next_group