import books from "datasources/KJV_bible.json";

export const seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('verses').del();

  const data = [];
  
  Object.keys(books).map(book => {
    Object.keys(book).map(chapter => {
      Object.keys(chapter).map(verse => {
        data.push({book, chapter, verse, version: "kjv"})
      })
    })
  })
  // Inserts seed entries
  await knex('verses').insert(data);
};
