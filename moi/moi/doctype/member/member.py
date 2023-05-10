# Copyright (c) 2023, Douglas Nkubitu and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address

class Member(Document):
	def validate(self):
		self.set_full_name()
		self.validate_email()
		# self.validate_age()
		
	def set_full_name(self):
		self.full_name = " ".join(filter(None, [self.first_name, self.last_name]))

	def validate_email(self):
		validate_email_address(self.email.strip(), True)

	# def validate_age(self):
	# 	self.age =
