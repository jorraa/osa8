
const { ApolloServer, UserInputError, gql, 
  AuthenticationError, PubSub } = require('apollo-server')
const DataLoader = require('dataloader')   
const mongoose = require('mongoose')
const Author = require('./src/models/Author')
const Book = require('./src/models/Book')
const User = require('./src/models/User')
require('dotenv').config()
const pubsub = new PubSub()

const jwt = require('jsonwebtoken')
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI 
console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const batchBooks = async (keys) => {
  const books = await Book.find({author: {$in: keys} })
  return keys.map(key => books.filter(book => `${book.author}` === key ) )
}

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
  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }
  

  type Token {
    value: String!
    user: User!
  }

  type Query {
    currentUser: User
    allUsers: [User!]!
    meee: User!
    authorCount: Int!
    allAuthors: [Author!]!
    findAuthor(name: String!): Author

    bookCount: Int!
    allBooks(genre: String): [Book!]!
    findUser(token: String): User!
  }

  type Mutation {

    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ):Book 

    editAuthor(
      name: String!
      setBornTo: Int!
    ):Author

    addAuthor(
      name: String,
      born: Int
    ):Author

    createUser(
      username: String!
    ): User
    
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }  
`
const uuid = require('uuid/v1')
const resolvers = {
  Query: {
    meee: (root, args,  { currentUser} ) => {
      console.log('in me, context.currentUser', currentUser)
            return currentUser
    },
    currentUser: (root, args, { currentUser }) => {
      return currentUser
    },
    allUsers: async () => await User.find({}) , 
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: async (root, args) => await Author.find({}),
    
    findAuthor: (root, args) => {
      return Author.findOne({ name: args.name } )
    },
    bookCount: () => Book.collection.countDocuments(),

    allBooks: async (root, args) =>{
      console.log('allBooks, args', args)
      if(args.genre) {
        const books =  await Book.find({genres: {$in: [args.genre]}}).populate('author')
        return books
      }
      return await Book.find({}).populate('author')
    }

  },
  
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
console.log('addBook, args', args)
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
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

      const populatedBook = await Book.findById(book.id).populate('author') 
      pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })
      return populatedBook
    },

    editAuthor: async (root, args, { currentUser }) => {
console.log('editAUthor,args', args)      
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
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
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
      },
      
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET), user: user }
    },
   
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },

  Author: { // bookLoader not working in playground
    books: async (root, args, context) => {
      const books = await context.loaders.bookLoader.load(root.id)
      return books
    },//await Book.find({ author:  root.id }),

           
    bookCount:  async (root, args, context) => {
      const books = await context.loaders.bookLoader.load(root.id)
      return books.length
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      const loaders = { bookLoader: new DataLoader(keys => batchBooks(keys)) }  
      return { currentUser , loaders }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})