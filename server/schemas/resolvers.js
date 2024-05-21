const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async () => {
            return User.find({});
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
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
        saveBook: async (parent, { user, body }) => {
            const updatedUser = await User.findOneAndUpdate(
                {_id: user._id},
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        },
        removeBook: async (parent, { user, params }) => {
            const updatedUser = await User.findOneAndUpdate(
                {_id: user._id},
                { $pull: { savedBooks: { bookId: params.bookId } } },
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