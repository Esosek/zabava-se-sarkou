import { defineCollection, z } from 'astro:content';

const serviceCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      isFeatured: z.boolean(),
      price: z.string(),
      age: z.string(),
      childrenCount: z.string(),
      tag: z.string().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      bottomContent: z.string().optional(),
      images: z.array(image()).optional(),
    }),
});

const testimonialCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      name: z.string(),
      occupation: z.string().optional(),
      age: z.number().optional(),
      date: z.date().optional(),
    }),
});

export const collections = {
  services: serviceCollection,
  testimonial: testimonialCollection,
};
