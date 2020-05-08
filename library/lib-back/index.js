const { ApolloServer, gql } = require('apollo-server')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]


const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
    books: [Book!]
  }
  type Book {
    title: String!
    published: Int! 
    author: String!
    id: ID!
    genres: [String!]!
  }
  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
    findAuthor(name: String!): Author

    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ):Book ,
    editAuthor(
      name: String!
      setBornTo: Int!
    ):Author
  }

`
const uuid = require('uuid/v1')
const resolvers = {
  Query: {
    authorCount: () => authors.length,
    allAuthors: () => authors,
    findAuthor: (root, args) =>
      authors.find(a => a.name === args.name),

    bookCount: () => books.length,  
    allBooks: (root, args) => {
      if(!args.author && !args.genre) {
        return books
      }
      if(!args.genre) {
        return books.filter(b => b.author === args.author)
      }
      if(!args.author) {
        return books.filter(b => b.genres.filter(g => g === args.genre).length)
      }
      return books.filter(b => b.author === args.author &&
        b.genres.filter(g => g === args.genre).length)
    }
  },
  
  Mutation: {
    addBook: (root, args) => {
console.log('addBook, args', args)      
     const author = authors.find(a=> a.name === args.name)
      if(!author) {
        newAuthor = { name: args.author, id: uuid() }
        authors = authors.concat(newAuthor)
      }
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      return book
    },
    editAuthor: (root, args) => {
console.log('editAUthor,args', args)      
      try{
      const author = authors.find(a=> a.name === args.name)
      if(!author) {
        return null
      }
      const updatedAuthor = { ...author, born: args.setBornTo}
      authors = authors.filter(a => a.id !== author.id).concat(updatedAuthor)
      return updatedAuthor
    }catch(error) {
      console.log('error', error)
    }
    }
  },
  Author: {
    books: (root) => books.filter(b => b.author === root.name), 
    bookCount: (root) => books.filter(b => b.author === root.name).length 
  } 
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})