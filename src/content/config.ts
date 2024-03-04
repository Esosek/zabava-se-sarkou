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

export const collections = {
  services: serviceCollection,
};
