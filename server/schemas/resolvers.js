const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select(
                    "-__v -password"
                );

                return userData;
            }

            throw new AuthenticationError("Not logged in");
        },
    },
    Mutation: {
        loginUser: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new error("Can't find this user.")
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new error("Incorrect password.");
            }

            const token = signToken(user);

            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });

            if(!user) {
                throw new error("Something went wrong.")
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args , context ) => {
            if(context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args } },
                    { new: true, runValidators: true }
                );
            }
            throw AuthenticationError;
        },
        removeBook: async (parent, { bookId }, context) => {
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            if(!updatedUser) {
                throw new error("Couldn't find user with that ID.")
            }
            return updatedUser;
        }
    }
};

module.exports = resolvers;