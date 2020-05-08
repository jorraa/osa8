const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./src/models/Author')
const Book = require('./src/models/Book')

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

mongoose.set('useFindAndModify', false)

//const MONGODB_URI = 'mongodb+srv://fullstack:sekred@cluster0-ostce.mongodb.net/graphql?retryWrites=true'
const MONGODB_URI = 'mongodb+srv://jorma:1jorma8183@cluster0-kmsw3.mongodb.net/lib-app?retryWrites=true&w=2`'
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

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
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
    findAuthor(name: String!): Author

    bookCount: Int!
    allBooks(genre: String): [Book!]!
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
    ):Author,
    addAuthor(
      name: String,
      born: Int
    ):Author
  }

`
const uuid = require('uuid/v1')
const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({}),
    findAuthor: (root, args) =>
      Author.findOne({ name: args.name } ),

    bookCount: () => Book.collection.countDocuments(),  
    allBooks: (root, args) => Book.find({}).populate('author')
/*    {
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
    }*/
  },
  
  Mutation: {
    addBook: async (root, args) => {
console.log('addBook, args', args)      
      const author = await Author.findOne({name: args.author})
      let newAuthor
      if(author === null) {
        newAuthor = new Author({name: args.author})
        try {
          await newAuthor.save()
        }catch(error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })  
        }
      }
      args.author = author?author.id:newAuthor.id
      const book = new Book({ ...args})

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return book
    },
    editAuthor: async (root, args) => {
console.log('editAUthor,args', args)      
      const author = await Author.findOne({ name: args.name})
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
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