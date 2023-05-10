# Copyright (c) 2023, Douglas Nkubitu and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address, validate_phone_number

class Member(Document):
	def validate(self):
		self.set_full_name()
		self.validate_email()
		self.validate_mobile_no()
		self.validate_user()
		
	def set_full_name(self):
		self.full_name = " ".join(filter(None, [self.first_name, self.last_name]))

	def validate_mobile_no(self):
		validate_phone_number(self.mobile_no.strip(), True)

	def validate_email(self):
		validate_email_address(self.email.strip(), True)

	def validate_user(self):
		exists = frappe.db.exists(
			"Member",
			{
				#check if there's a member using the same mobile number 
				"mobile_no": self.mobile_no,
				"docstatus": 1,
			},
		)
		if exists:
			frappe.throw(f"{self.full_name} is already Registed")