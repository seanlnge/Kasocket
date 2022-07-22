/* This file is purely for creating and parsing operations sent from the server to the client, not vice versa */
export type Operation = ClientMutation | ClientCreation | Initializer

/**
 * Create a client mutation object
 * @param mutation Necessary information to mutate client
 * @returns Client mutation object to include in operation bundle
 */
export const MutateClient = (mutation: Omit<ClientMutation, 'operation'>): ClientMutation => ({
    operation: 'mut', ...mutation,
});
export type ClientMutation = {
    time: number;
    operation: 'mut';
    id: string;
    instruction: 'set' | 'define' | 'delete';
    instance: 'public' | 'private';
    path: string[];
    property: string;
    value?: any;
};

/**
 * Create a client creation object
 * @param creation Necessary information to create client
 * @returns Client creation object to include in operation bundle
 */
export const CreateClient = (creation: Omit<ClientCreation, 'operation'>): ClientCreation => ({
    operation: 'cre', ...creation
});
export type ClientCreation = {
    time: number;
    operation: 'cre';
    id: string;
    client: { [key: string]: any }
};

/**
 * Create a self initiailzation object
 * @param init Initial client data
 * @returns Self initialization object to include in operation bundle
 */
export const Initialize = (init: Omit<Initializer, 'operation'>): Initializer => ({
    operation: 'init', ...init
});
export type Initializer = {
    time: number;
    operation: 'init';
    id: string;
    clients: { [key: string]: { [key: string]: any } };
    clientData: {
        public: { [key: string]: any },
        private: { [key: string]: any }
    };
}