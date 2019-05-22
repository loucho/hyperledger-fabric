## Hyperledger Fabric Example

I've made some modifications to the commercial paper sample, but made it so it doesn need to change anything for the installation. 
So following the instructionos on this link ([installation instructions](https://hyperledger-fabric.readthedocs.io/en/release-1.4/tutorial/commercial_paper.html)) should still work to get it up and running.

I added a new smart contract for the bookstore, and added scripts to consume them for both organizations, which can be found in the `commercial-paper/organization/digibank/application` and `commercial-paper/organization/magnetocorp/application` folders.

The new contract is in the `commercial-paper/organization/magnetocorp/contract/` folder.