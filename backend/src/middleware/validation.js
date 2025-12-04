import Joi from 'joi';

export const validateEmployee = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    personalInfo: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      dateOfBirth: Joi.date(),
      gender: Joi.string().valid('male', 'female', 'other'),
      maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed'),
      nationality: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
      }),
      emergencyContact: Joi.object({
        name: Joi.string(),
        relationship: Joi.string(),
        phone: Joi.string()
      })
    }).required(),
    employmentInfo: Joi.object({
      department: Joi.string().required(),
      position: Joi.string().required(),
      employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern'),
      joinDate: Joi.date().required(),
      probationEndDate: Joi.date(),
      confirmationDate: Joi.date(),
      resignationDate: Joi.date(),
      status: Joi.string().valid('active', 'inactive', 'terminated', 'on-leave')
    }).required(),
    compensation: Joi.object({
      basicSalary: Joi.number().min(0),
      allowances: Joi.array().items(Joi.object({
        type: Joi.string(),
        amount: Joi.number().min(0)
      })),
      currency: Joi.string()
    }),
    manager: Joi.string(),
    workLocation: Joi.string().valid('office', 'remote', 'hybrid'),
    skills: Joi.array().items(Joi.string()),
    certifications: Joi.array().items(Joi.object({
      name: Joi.string(),
      issuer: Joi.string(),
      issueDate: Joi.date(),
      expiryDate: Joi.date(),
      credentialId: Joi.string()
    }))
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateLeave = (req, res, next) => {
  const schema = Joi.object({
    leaveType: Joi.string().valid('annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'unpaid').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    days: Joi.number().min(0.5).required(),
    reason: Joi.string().required(),
    isHalfDay: Joi.boolean(),
    halfDayType: Joi.string().valid('first-half', 'second-half'),
    coverEmployee: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateTravel = (req, res, next) => {
  const schema = Joi.object({
    purpose: Joi.string().required(),
    destination: Joi.object({
      country: Joi.string(),
      city: Joi.string(),
      address: Joi.string()
    }),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    transportation: Joi.object({
      type: Joi.string().valid('flight', 'train', 'bus', 'car', 'taxi', 'other'),
      details: Joi.string(),
      cost: Joi.number().min(0)
    }),
    accommodation: Joi.object({
      type: Joi.string().valid('hotel', 'guesthouse', 'apartment', 'other'),
      details: Joi.string(),
      cost: Joi.number().min(0)
    }),
    dailyAllowance: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string(),
      days: Joi.number().min(1)
    }),
    advanceAmount: Joi.number().min(0),
    itinerary: Joi.array().items(Joi.object({
      date: Joi.date(),
      activity: Joi.string(),
      location: Joi.string(),
      cost: Joi.number().min(0)
    })),
    isInternational: Joi.boolean(),
    visaRequired: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};