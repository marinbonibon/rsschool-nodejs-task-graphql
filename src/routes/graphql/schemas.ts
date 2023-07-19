import { Type } from '@fastify/type-provider-typebox';
import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const MemberType = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
        id: {type: GraphQLString},
        discount: {type: GraphQLFloat},
        postsLimitPerMonth: {type: GraphQLInt},
    }),
})

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: () => ({
        memberTypes: {
            type: new GraphQLList(MemberType),
            args: {},
            async resolve(obj, args, prisma, info) {
                return await prisma.memberType.findMany();
            }
        },
    }),

})

export const schema = new GraphQLSchema({
    query: RootQueryType
})
