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
      videos: z.array(z.string()).optional(),
      images: z.array(image()).optional(),
    }),
});

const articleCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

const testimonialCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      title: z.string(),
      occupation: z.string().optional(),
      age: z.number().optional(),
      date: z.date().optional(),
    }),
});

export const collections = {
  services: serviceCollection,
  articles: articleCollection,
  testimonial: testimonialCollection,
};
