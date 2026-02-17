<?php

namespace App\Controller;

use App\Entity\Contact;
use App\Repository\ContactRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/contact', name: 'api_contact_')]
final class ContactController extends AbstractController
{
    private $entityManager;
    private $repository;

    public function __construct(EntityManagerInterface $entityManager, ContactRepository $repository)
    {
        $this->entityManager = $entityManager;
        $this->repository = $repository;
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            return $this->json(['error' => 'Datos incompletos'], Response::HTTP_BAD_REQUEST);
        }

        $contact = new Contact();
        $contact->setName($data['name']);
        $contact->setEmail($data['email']);
        $contact->setMessage($data['message']);
        $contact->setRead(false);

        $this->entityManager->persist($contact);
        $this->entityManager->flush();

        return $this->json(['message' => 'Mensaje enviado correctamente'], Response::HTTP_CREATED);
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $messages = $this->repository->findBy([], ['id' => 'DESC']);
        
        return $this->json($messages);
    }

    #[Route('/{id}/toggle-read', name: 'toggle_read', methods: ['PATCH'])]
    public function toggleRead(Contact $contact, EntityManagerInterface $em): JsonResponse
    {
        $contact->setRead(!$contact->isRead());
        
        $em->flush();

        return $this->json([
            'id' => $contact->getId(),
            'read' => $contact->isRead(),
            'message' => 'Estado actualizado correctamente'
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Contact $contact): JsonResponse
    {
        $this->entityManager->remove($contact);
        $this->entityManager->flush();

        return $this->json(['message' => 'Mensaje eliminado']);
    }
}