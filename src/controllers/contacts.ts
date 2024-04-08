import { RequestHandler } from "express";
import prisma from "@/configs/prisma";
import z from "zod";
import { formatZodErrors } from "@/utils";
import { createContactSchema, contactSchema } from "@/schemas/contacts.schema";
import { Handler } from "hono";

export const getContacts: Handler = async (c) => {
	try {
		const contacts = await prisma.contact.findMany();
		return c.json({ message: "Hello World" });
	} catch (error) {
		console.log(error);

		c.status(500);
		c.json({ message: "Internal server error" });
	}
};

export const createContact: Handler = async (c) => {
	try {
		const { address, ...contactData } = createContactSchema.parse(c.body);
		const exisingContact = await prisma.contact.findUnique({
			where: {
				email_phone: {
					email: contactData.email,
					phone: contactData.phone,
				},
			},
		});
		if (exisingContact) {
			c.status(400);
			return c.json({ message: "Contact already exists" });
		}

		const contact = await prisma.contact.create({
			data: {
				...contactData,
				address: {
					create: {
						...address,
					},
				},
			},
		});
		if (contact) {
			return c.json(contact);
		}
		c.status(500);
		return c.json({ message: "Failed to create contact" });
	} catch (error) {
		if (error instanceof z.ZodError) {
			c.status(400);
			return c.json({
				message: "Invalid data",
				errors: formatZodErrors(error),
			});
		}
		c.status(500);
		return c.json({ message: "Internal server error" });
	}
};

export const updateContact: Handler = async (c) => {
	try {
		const id = c.req.param("id");
		if (!id || isNaN(parseInt(id))) {
			c.status(400);
			return c.json({ message: "Invalid contact id" });
		}
		const { address, ...contactData } = createContactSchema.parse(c.body);
		const contact = await prisma.contact.update({
			where: {
				id: parseInt(id),
			},
			data: {
				...contactData,
				address: {
					update: {
						...address,
					},
				},
			},
		});
		if (contact) {
			return c.json(contact);
		}
		c.status(500);
		return c.json({ message: "Failed to update contact" });
	} catch (error) {
		if (error instanceof z.ZodError) {
			c.status(400);
			return c.json({
				message: "Invalid data",
				errors: formatZodErrors(error),
			});
		}
		c.status(500);
		return c.json({ message: "Internal server error" });
	}
};

export const deleteContact: Handler = async (c) => {
	try {
		const id = c.req.param("id");
		if (!id || isNaN(parseInt(id))) {
			c.status(400);
			return c.json({ message: "Invalid contact id" });
		}
		const contact = await prisma.contact.delete({
			where: {
				id: parseInt(id),
			},
		});
		if (contact) {
			return c.json(contact);
		}
		c.status(500);
		return c.json({ message: "Failed to delete contact" });
	} catch (error) {
		console.log(error);
		c.status(500);
		return c.json({ message: "Internal server error" });
	}
};

export const updateContactField: Handler = async (c) => {
	try {
		const id = c.req.param("id");
		if (!id || isNaN(parseInt(id))) {
			c.status(400);
			return c.json({ message: "Invalid contact id" });
		}
		const contactData = contactSchema.parse(c.body);
		if (Object.keys(contactData).length === 0) {
			c.status(400);
			return c.json({ message: "No data provided" });
		}
		const contact = await prisma.contact.update({
			where: {
				id: parseInt(id),
			},
			data: {
				...contactData,
			},
		});
		if (contact) {
			return c.json(contact);
		}
		c.status(500);
		return c.json({ message: "Failed to update contact" });
	} catch (error) {
		if (error instanceof z.ZodError) {
			c.status(400);
			return c.json({
				message: "Invalid data",
				errors: formatZodErrors(error),
			});
		}
		c.status(500);
		return c.json({ message: "Internal server error" });
	}
};

export const getContact: Handler = async (c) => {
	try {
		const id = c.req.param("id");
		if (!id || isNaN(parseInt(id))) {
			c.status(400);
			return c.json({ message: "Invalid contact id" });
		}
		const contact = await prisma.contact.findUnique({
			where: {
				id: parseInt(id),
			},
			include: {
				address: true,
			},
		});
		if (contact) {
			return c.json(contact);
		}
		c.status(404);
		return c.json({ message: "Contact not found" });
	} catch (error) {
		c.status(500);
		return c.json({ message: "Internal server error" });
	}
};
