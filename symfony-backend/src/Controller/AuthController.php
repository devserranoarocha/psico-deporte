<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api', name: 'api_')]
final class AuthController extends AbstractController
{
    private $entityManager;
    private $passwordHasher;

    public function __construct(
        EntityManagerInterface $entityManager, 
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Interceptado por LexikJWT según security.yaml
        return $this->json(['message' => 'Check security.yaml configuration.']);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getMe(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'No autenticado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUserIdentifier(),
            'email' => $user->getEmail(), // Nuevo campo incluido
        ]);
    }

    #[Route('/user/update', name: 'user_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'No autorizado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        // 1. Cambiar el nombre de usuario
        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }

        // 2. Cambiar el email (Nuevo)
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        // 3. Cambiar la contraseña
        if (isset($data['password']) && !empty($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                $data['password']
            );
            $user->setPassword($hashedPassword);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Usuario actualizado correctamente',
            'username' => $user->getUserIdentifier(),
            'email' => $user->getEmail()
        ]);
    }
    #[Route('/recover-password', name: 'recover_password', methods: ['POST'])]
    public function recoverPassword(Request $request, \App\Repository\UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';

        // Buscamos un usuario que coincida con AMBOS campos
        $user = $userRepository->findOneBy([
            'username' => $username,
            'email' => $email
        ]);

        if (!$user) {
            return $this->json(['error' => 'Datos inválidos'], JsonResponse::HTTP_NOT_FOUND);
        }

        // --- LÓGICA DE ENVÍO DE EMAIL PENDIENTE ---
        // Aquí se generaria una contraseña temporal, se guardaria en el usuario y enviarías el correo.

        return $this->json(['message' => 'Email enviado correctamente']);
    }
}